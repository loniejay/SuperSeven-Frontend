'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HomeContainer } from '@/sections/adminHome/styles';
import { HeadingComponent } from '@/components/Heading';
import { SearchBox } from '@/components/Search';
import { PackageCardComponent } from '@/components/PackageCard';
import { ActionButton, LeftButton, RightButton } from '@/sections/settings/styles';
import { AddAccount } from '@/sections/accounts/styles';
import { PackageContent, PackageWrapper } from './styles';
import { Box, Typography } from '@mui/material';
import { fetchPackages, fetchAddons, deletePackage, deleteAddon } from '@/lib/api/fetchPackage';
import DataTable from './DataTable';
import { PackageModalComponent } from '@/components/Modal/PackageModal';
import Swal from 'sweetalert2'; 
import { useAuth } from '@/context/AuthContext';
import { CustomTablePagination } from '@/components/TablePagination';
import { useLoading } from '@/context/LoadingContext';

export function PackageHome(): React.JSX.Element {
    const { showLoader, hideLoader } = useLoading();
    const [activeTab, setActiveTab] = useState<'package' | 'add-ons'>('package');
    const [searchTerm, setSearchTerm] = useState('');
    const [packageData, setPackageData] = useState<any[]>([]);
    const [addonsData, setAddonsData] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'package' | 'addon'>('package');
    const [currentItem, setCurrentItem] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Pagination states
    const [packagePage, setPackagePage] = useState(1);
    const [packageRowsPerPage, setPackageRowsPerPage] = useState(10);
    const [packageTotal, setPackageTotal] = useState(0);
    
    const [addonsPage, setAddonsPage] = useState(1);
    const [addonsRowsPerPage, setAddonsRowsPerPage] = useState(10);
    const [addonsTotal, setAddonsTotal] = useState(0);

    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [cache, setCache] = useState<Record<string, { data: any[], total: number }>>({});

    const { user, isLoggingOut } = useAuth();
    const isClient = ['Client', 'Coordinator'].includes(user?.user_role ?? '');

    const fetchData = useCallback(async () => {
        const cacheKey = `${activeTab}-${searchTerm}-${
            activeTab === 'package' ? packagePage : addonsPage
        }-${activeTab === 'package' ? packageRowsPerPage : addonsRowsPerPage}`;
        
        // Return cached data if available (except for initial load)
        if (cache[cacheKey] && !isInitialLoad) {
            if (activeTab === 'package') {
                setPackageData(cache[cacheKey].data);
                setPackageTotal(cache[cacheKey].total);
            } else {
                setAddonsData(cache[cacheKey].data);
                setAddonsTotal(cache[cacheKey].total);
            }
            return;
        }

        try {
            // Show full loader only for initial load or filter changes
            if (isInitialLoad || (activeTab === 'package' ? packagePage === 1 : addonsPage === 1)) {
                showLoader();
            } else {
                setIsTableLoading(true);
            }
            
            if (activeTab === 'package') {
                const response = await fetchPackages(
                    searchTerm, 
                    packagePage, 
                    packageRowsPerPage,
                    isLoggingOut
                );
                
                const data = isClient 
                    ? Array.isArray(response?.data) ? response.data : []
                    : Array.isArray(response?.data?.data) ? response.data.data : [];
                    
                setPackageData(data);
                
                if (!isClient && response?.data?.meta) {
                    setPackageTotal(response.data.meta.total);
                }

                // Update cache
                setCache(prev => ({
                    ...prev,
                    [cacheKey]: {
                        data,
                        total: response?.data?.meta?.total || 0
                    }
                }));
            } else {
                const response = await fetchAddons(
                    searchTerm, 
                    addonsPage, 
                    addonsRowsPerPage,
                    isLoggingOut
                );
                
                const data = isClient 
                    ? Array.isArray(response?.data) ? response.data : []
                    : Array.isArray(response?.data?.data) ? response.data.data : [];
                    
                setAddonsData(data);
                
                if (!isClient && response?.data?.meta) {
                    setAddonsTotal(response.data.meta.total);
                }

                // Update cache
                setCache(prev => ({
                    ...prev,
                    [cacheKey]: {
                        data,
                        total: response?.data?.meta?.total || 0
                    }
                }));
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to fetch data');
        } finally {
            if (isInitialLoad) {
                setIsInitialLoad(false);
            }
            setIsTableLoading(false);
            hideLoader();
        }
    }, [
        activeTab, 
        searchTerm, 
        isClient,
        packagePage,
        packageRowsPerPage,
        addonsPage,
        addonsRowsPerPage,
        isLoggingOut,
        isInitialLoad,
        cache,
        showLoader,
        hideLoader
    ]);

    // Debounced API call effect
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 300);

        return () => clearTimeout(timer);
    }, [fetchData]);

    // Reset to first page when filters change
    useEffect(() => {
        setPackagePage(1);
        setAddonsPage(1);
    }, [searchTerm, activeTab]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    const handleOpenModal = useCallback((item: any = null) => {
        setCurrentItem(item);
        setModalType(activeTab === 'package' ? 'package' : 'addon');
        setIsModalOpen(true);
    }, [activeTab]);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const handleSuccess = useCallback(() => {
        // Invalidate cache and refetch
        setCache({});
        fetchData();
    }, [fetchData]);

    const handleDelete = useCallback(async (item: any) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete this ${activeTab === 'package' ? 'package' : 'add-on'}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#AAAAAA',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'custom-swal-popup',
                confirmButton: 'custom-swal-confirm',
                cancelButton: 'custom-swal-cancel'
            }
        });

        if (!result.isConfirmed) return;

        try {
            setIsDeleting(true);
            showLoader();
            
            activeTab === 'package' 
                ? await deletePackage(item.id) 
                : await deleteAddon(item.id);
            
            Swal.fire({
                title: 'Deleted!',
                text: `The ${activeTab === 'package' ? 'package' : 'add-on'} has been deleted.`,
                icon: 'success',
                confirmButtonColor: '#2BB673',
                customClass: { popup: 'custom-swal-popup' }
            });
            
            // Invalidate cache and refetch
            setCache({});
            fetchData();
        } catch (err) {
            console.error('Delete error:', err);
            Swal.fire({
                title: 'Error!',
                text: `Failed to delete ${activeTab === 'package' ? 'package' : 'add-on'}.`,
                icon: 'error',
                confirmButtonColor: '#2BB673',
                customClass: { popup: 'custom-swal-popup' }
            });
        } finally {
            setIsDeleting(false);
            hideLoader();
        }
    }, [activeTab, fetchData, showLoader, hideLoader]);

    const handlePackagePageChange = useCallback((
        event: React.MouseEvent<HTMLButtonElement> | null, 
        newPage: number
    ) => {
        setPackagePage(newPage + 1);
    }, []);

    const handlePackageRowsPerPageChange = useCallback((
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setPackageRowsPerPage(newRowsPerPage);
        setPackagePage(1);
    }, []);

    const handleAddonsPageChange = useCallback((
        event: React.MouseEvent<HTMLButtonElement> | null, 
        newPage: number
    ) => {
        setAddonsPage(newPage + 1);
    }, []);

    const handleAddonsRowsPerPageChange = useCallback((
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setAddonsRowsPerPage(newRowsPerPage);
        setAddonsPage(1);
    }, []);

    const tableConfig = useMemo(() => ({
        package: {
            headers: ['Package Name', 'Price', 'Details', 'Action'],
            data: packageData,
            noDataText: 'No packages found',
            type: 'package' as const
        },
        'add-ons': {
            headers: ['Add-on Name', 'Price', 'Details', 'Action'],
            data: addonsData,
            noDataText: 'No add-ons found',
            type: 'addon' as const
        }
    }), [packageData, addonsData]);

    // Get the current data to display based on active tab and user type
    const currentData = useMemo(() => {
        return activeTab === 'package' ? packageData : addonsData;
    }, [activeTab, packageData, addonsData]);

    const filteredClientData = useMemo(() => {
        if (!isClient) return currentData;

            return currentData.filter((item) => {
                const name = activeTab === 'package' ? item.package_name : item.add_on_name;
                return name.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [currentData, searchTerm, activeTab, isClient]);

    return (
        <HomeContainer>
            <HeadingComponent />
            <PackageContent>
                <ActionButton>
                    <LeftButton 
                        className={`btn ${activeTab === 'package' ? 'active' : ''}`}
                        onClick={() => setActiveTab('package')}
                    >
                        Package
                    </LeftButton>
                    <RightButton 
                        className={`btn ${activeTab === 'add-ons' ? 'active' : ''}`}
                        onClick={() => setActiveTab('add-ons')}
                    >
                        Add-ons
                    </RightButton>
                    {!isClient && (
                        <AddAccount 
                            sx={{ marginLeft: '25px' }}
                            onClick={() => handleOpenModal()}
                        >
                            {activeTab === 'package' ? 'Add Package' : 'Add Add-on'}
                        </AddAccount>
                    )}
                    

                    {isClient && (
                        <SearchBox 
                            searchTerm={searchTerm}
                            onSearchChange={handleSearchChange}
                        />
                    )}
                </ActionButton>
                
                {!isClient && (
                    <SearchBox 
                        searchTerm={searchTerm}
                        onSearchChange={handleSearchChange}
                    />
                )}

                
            </PackageContent>
            
            {!isClient ? (
                <Box sx={{ marginBottom: '150px' }}>
                    {error ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                            Error: {error}
                        </Box>
                    ) : (
                        <>
                            <DataTable
                                {...tableConfig[activeTab]}
                                isLoading={isTableLoading || isDeleting}
                                onEdit={handleOpenModal}
                                onDelete={handleDelete}
                            />
                            
                            {/* Pagination for package tab */}
                            {activeTab === 'package' && (
                                <CustomTablePagination
                                    count={packageTotal}
                                    rowsPerPage={packageRowsPerPage}
                                    page={packagePage - 1}
                                    onPageChange={handlePackagePageChange}
                                    onRowsPerPageChange={handlePackageRowsPerPageChange}
                                />
                            )}
                            
                            {/* Pagination for addons tab */}
                            {activeTab === 'add-ons' && (
                                <CustomTablePagination
                                    count={addonsTotal}
                                    rowsPerPage={addonsRowsPerPage}
                                    page={addonsPage - 1}
                                    onPageChange={handleAddonsPageChange}
                                    onRowsPerPageChange={handleAddonsRowsPerPageChange}
                                />
                            )}
                        </>
                    )}
                </Box>
            ) : (
                <PackageWrapper>
                    {isTableLoading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                            <Typography>Loading...</Typography>
                        </Box>
                    ) : error ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                            <Typography color="error">Error: {error}</Typography>
                        </Box>
                    ) : filteredClientData.length === 0 ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                            <Typography variant="body1">
                                No {activeTab === 'package' ? 'packages' : 'add-ons'} available
                            </Typography>
                        </Box>
                    ) : (
                        filteredClientData.map((item) => {
                            const isPackage = activeTab === 'package';
                            return (
                                <PackageCardComponent 
                                    key={item.id} 
                                    packageItem={{
                                        id: item.id,
                                        package_name: isPackage ? item.package_name : item.add_on_name,
                                        package_details: isPackage ? item.package_details : item.add_on_details,
                                        package_details_list: isPackage 
                                            ? item.package_details_list 
                                            : undefined,
                                        package_price: isPackage ? item.package_price : item.add_on_price
                                    }} 
                                />
                            );
                        })
                    )}
                </PackageWrapper>
            )}

            {isModalOpen && (
                <PackageModalComponent 
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    modalType={modalType}
                    onSuccess={handleSuccess}
                    item={currentItem}
                />
            )}
        </HomeContainer>
    );
}