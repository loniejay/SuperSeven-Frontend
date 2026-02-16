'use client';

import React, { useEffect, useState } from 'react';
import { PackageLayout, LayoutContaier, CardBox, ImageContainer, PackageContent, PackageButton } from './styles';
import Image from 'next/image';
import { icons } from '@/icons';
import { Typography, Button, Box, Skeleton, CircularProgress } from '@mui/material';
import { fetchDashboardPackages } from '@/lib/api/fetchPackage';
import { Package } from '@/types/package';
import { useAuth } from '@/context/AuthContext';
import { useLoading } from '@/context/LoadingContext';
import { formatCurrency } from '@/utils/billing';
import { useRouter, useSearchParams } from 'next/navigation';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination'; 
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import 'swiper/css/effect-fade';

export function DashboardPackageCard() {
    const { showLoader, hideLoader } = useLoading();
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [packages, setPackages] = useState<Package[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { isLoggingOut } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams()
    

    useEffect(() => {
        const loadPackages = async () => {
            showLoader();
            try {
                const data = await fetchDashboardPackages(isLoggingOut);
                setPackages(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setIsInitialLoad(false);
                hideLoader();
            }
        };

        loadPackages();
    }, []);

    const handleBookNowClick = (pkg: Package) => {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set('add', 'true');
        newSearchParams.set('package', pkg.id.toString());
        router.push(`/booking?${newSearchParams.toString()}`);
    };

    if (isInitialLoad) {
        return (
            <PackageLayout>
                <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                    <CircularProgress />
                </Box>
            </PackageLayout>
        )
    }

    if (error) {
        return (
            <PackageLayout>
                <Typography color="error">{error}</Typography>
            </PackageLayout>
        );
    }

    if (packages.length === 0) {
        return null;
    }

    return (
        <PackageLayout>
            <Box className="heading">
                <Typography component="h2">
                    Packages
                </Typography>
            </Box>
            <LayoutContaier>
                <Swiper
                    modules={[Pagination, Autoplay]}
                    spaceBetween={30}
                    slidesPerView={1}
                    loop={true}
                    speed={2000}
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                    }}
                    pagination={{
                        clickable: true,
                    }}
                    breakpoints={{
                        320: {
                            slidesPerView: 1,
                            spaceBetween: 20
                        },
                        768: {
                            slidesPerView: 2,
                            spaceBetween: 30
                        },
                        1024: {
                            slidesPerView: 5,
                            spaceBetween: 40
                        }
                    }}
                >
                    {packages.map((pkg) => (
                        <SwiperSlide key={pkg.id}>
                            
                            <CardBox key={pkg.id}>
                                <ImageContainer>
                                    {pkg.image_path ? (
                                        <img
                                            src={`/storage/${pkg.image_path}`}
                                            alt={pkg.package_name} 
                                        />
                                    ) : (
                                        <img
                                            src={icons.imagePlacholder} 
                                            alt="Package placeholder" 
                                        />
                                    )}
                                </ImageContainer>
                                <PackageContent>
                                    <Typography component="h2" className="package-name">
                                        {pkg.package_name}
                                    </Typography>
                                    <Typography component="p" className="package-description">
                                        {pkg.package_details}
                                    </Typography>
                                    <Typography component="span" className="package-amount">
                                        {formatCurrency(pkg.package_price)}
                                    </Typography>
                                </PackageContent>
                                <PackageButton>
                                    <Button onClick={() => handleBookNowClick(pkg)}>
                                        <Typography className="label">
                                            Book Now
                                        </Typography>
                                        <Image src={icons.arrowIcon} width={20} height={20} alt="Package" />
                                    </Button>
                                </PackageButton>
                            </CardBox>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </LayoutContaier>
        </PackageLayout>
    );
}