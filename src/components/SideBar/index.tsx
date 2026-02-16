"use client";
import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { SideBarContainer } from './styles';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HouseIcon from '@mui/icons-material/House';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import PaymentsIcon from '@mui/icons-material/Payments';
import RateReviewIcon from '@mui/icons-material/RateReview';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { paths } from '@/paths';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Swal from 'sweetalert2';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { icons } from '@/icons';
import { useSidebar } from '@/context/SidebarContext';
import { useLoading } from '@/context/LoadingContext'

interface MenuItem {
    id: string;
    label: string;
    link: string;
    icon: React.ReactNode;
    type: 'menu' | 'bottom' | 'separator';
}

export function NavBar(): React.JSX.Element {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const [isClient, setIsClient] = useState(false);
    const { isOpen } = useSidebar();
    const { showLoader } = useLoading()
    
    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You will be logged out of the system.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, logout!',
            allowOutsideClick: false,
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    await logout();
                    return true;
                } catch (error) {
                    console.error('Logout failed:', error);
                    Swal.showValidationMessage('Logout failed. Please try again.');
                    return false;
                }
            }
        });

        if (result.isConfirmed) {
            await Swal.fire({
                title: 'Logged out!',
                text: 'You have been successfully logged out.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        }
    };

    const isActiveItem = (itemLink: string): boolean => {
        if (itemLink === paths.home) {
            return pathname === paths.home;
        }
        return pathname.startsWith(itemLink);
    };

    const allMenuItems: MenuItem[] = [
        {
            id: '1',
            label: 'Home',
            link: paths.home,
            icon: <HouseIcon />,
            type: 'menu'
        },
        {
            id: '2',
            label: 'Accounts',
            link: paths.accounts,
            icon: <GroupOutlinedIcon />,
            type: 'menu'
        },
        {
            id: '3',
            label: 'Booking',
            link: paths.booking,
            icon: <CalendarMonthIcon />,
            type: 'menu'
        },
        {
            id: '4',
            label: 'Workload',
            link: paths.workload,
            icon: <ListAltIcon />,
            type: 'menu'
        },
        {
            id: '5',
            label: 'Package',
            link: paths.package,
            icon: <CardGiftcardIcon />,
            type: 'menu'
        },
        {
            id: '6',
            label: 'Billing',
            link: paths.billing,
            icon: <PaymentsIcon />,
            type: 'menu'
        },
        {
            id: '7',
            label: 'Feedback',
            link: paths.feedback,
            icon: <RateReviewIcon />,
            type: 'menu'
        },
        {
            id: '8',
            label: 'Reports',
            link: paths.reports,
            icon: <StackedBarChartIcon />,
            type: 'menu'
        },
        {
            id: '9',
            type: 'separator',
            label: '',
            link: '#',
            icon: null
        },
        {
            id: '10',
            label: 'Settings',
            link: paths.settings,
            icon: <SettingsIcon />,
            type: 'bottom'
        },
        {
            id: '11',
            label: 'Logout',
            link: '#',
            icon: <PowerSettingsNewIcon />,
            type: 'bottom'
        },
    ];

    const getFilteredMenuItems = () => {
        if (!user) return [];

        return allMenuItems.filter((item) => {
            if (item.type === 'separator') return true;
            if (item.label === 'Settings' || item.label === 'Logout') return true;

            switch (user.user_role) {
                case 'Coordinator':
                case 'Client':
                    return ['Home', 'Booking', 'Package', 'Billing'].includes(item.label);
                case 'Photographer':
                case 'Editor':
                    return ['Home', 'Workload'].includes(item.label);
                case 'Owner':
                    return true;
                case 'Secretary':
                    return !['Billing'].includes(item.label);
                default:
                    return false;
            }
        });
    };

    const filteredMenuItems = isClient ? getFilteredMenuItems() : [];

    return (
        <SideBarContainer className={`navbar ${isOpen ? '' : 'minimized'}`}>
            <Box className="logo-container">
                <Image width={60} height={60} src={icons.favIcon} alt="fav icon" />
                <Image width={150} height={50} priority src={icons.logo} alt="logo" />
            </Box>
            <Box className="menu-items-container">
                {filteredMenuItems.map((item, index) => {
                    if (item.type === 'separator') {
                        return <hr key={`separator-${index}`} className='side-bar-horizontal-rule'/>;
                    }
                    
                    const active = isActiveItem(item.link);
                    const className = `menu-item ${active ? 'active' : ''}`;

                    if (item.label === 'Logout') {
                        return (
                            <Link 
                                href="#"
                                className={className}  
                                key={item.id}
                                onClick={handleLogout}
                            >
                                {item.icon}
                                <p>{item.label}</p>
                            </Link>
                        );
                    }
                    
                    return (
                        <Link 
                            href={item.link} 
                            className={className}  
                            key={item.id}
                            onClick={() => showLoader()}
                        >
                            {item.icon}
                            <p>{item.label}</p>
                        </Link>
                    );
                })}
            </Box>
        </SideBarContainer>
    );
}