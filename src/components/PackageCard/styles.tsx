import { Box, styled } from "@mui/material";

export const PackageButton = styled(Box)`
    width: 100%;
    height: auto;
    padding: 0 16px;
    margin: 10px 0;

    button {
        display: flex;
        margin: 0;
        padding: 0;
        width: fit-content;
        height: auto;
        padding: 8px 23px;
        border-radius: 11px;
        background: #2BB673;
        margin-left: auto;

        .label {
            font-family: 'Nunito Sans';
            font-weight: 500;
            font-size: 14px;
            line-height: 28px;
            letter-spacing: 1px;
            text-transform: capitalize;
            color: #FFFFFF;
        }

        img {
            margin-left: 10px;
        }

        &:hover {
            background: #155D3A;
        }
    }
`;

export const PackageContent = styled(Box)`
    width: 100%;
    height: auto;
    padding: 0 16px;

    .package-name {
        padding: 0;
        margin: 0;
        font-family: 'Nunito Sans';
        font-weight: 600;
        font-size: 18px;
        line-height: 25px;
        color: #202224;
        padding: 10px 0;
    }

    .package-description {
        padding: 0;
        margin: 0;
        font-family: 'Nunito Sans';
        font-weight: 400;
        font-size: 12px;
        line-height: 26px;
        color: #6E7070;
        padding-bottom: 10px;
    }

    .package-amount {
        padding: 0;
        margin: 0;
        font-family: 'Nunito Sans';
        font-weight: 600;
        font-size: 24px;
        line-height: 36px;
        color: #0D0D0C;
        padding-bottom: 10px;
    }
`;

export const ImageContainer = styled(Box)`
    width: 100%;
    height: 225px;

    img {
        width: 100%;
        height: 225px;
        object-fit: cover;
        border-radius: 12px;
    }
`;

export const CardBox = styled(Box)`
    width: auto;
    height: auto;
    background: #FFFFFF;
    border: 1px solid #E0E0E0;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
`;

export const LayoutContaier = styled(Box)`
    width: 100%;
    height: auto;

    .swiper-pagination {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: auto;
        margin-top: 40px;
        margin-bottom: 40px;

        .swiper-pagination-bullet {
            border: 3px solid #2BB673;
            border-radius: 2px;
            cursor: pointer;
            display: inline-block;
            height: 5px;
            margin: 0 1px !important;
            opacity: .4;
            transition: opacity .3s;
            width: 22px;
        }

        .swiper-pagination-bullet-active {
            border-color: #2BB673;
            background-color: #fff;
            opacity: 1 !important;
        }
    }
`;

export const PackageLayout = styled(Box)`
    width: 100%;
    height: auto;

    .heading {
        padding: 20px 0;
        border-bottom: 1px solid #E0E0E0;
        margin-bottom: 30px;
        h2 {
            font-family: 'Nunito', sans-serif;
            font-size: 32px;
            font-weight: 700;
            color: #202224;
            margin: 0;
        }
    }
`;

export const PackagePrice = styled(Box)`
    width: 100%;
    height: auto;
    background: #2BB673;
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 10px 0;

    p {
        padding: 0;
        margin: 0;
        font-family: Nunito Sans;
        font-weight: 600;
        font-size: 35px;
        line-height: 60px;
        letter-spacing: 0px;
        color: #FFFFFF;
    }
`;

export const PackageDetails = styled(Box)`
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0 50px;
    padding-bottom: 30px;

    p {
        font-family: Nunito Sans;
        font-weight: 400;
        font-size: 18px;
        line-height: 24px;
        color: rgba(32, 34, 36, 0.6);
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;

        li {
            padding: 0;
            padding-left: 20px;
            margin-left: 10px;

            &:before {
                content: "";
                position: absolute;
                top: 7px;
                left: 0;
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: rgba(32, 34, 36, 0.6);
                margin-right: 10px;
            }

            > div {
                margin: 0;

                span {
                    font-family: Nunito Sans;
                    font-weight: 400;
                    font-size: 16px;
                    line-height: 24px;
                    color: rgba(32, 34, 36, 0.6);
                }
            }
        }
    }
`;

export const PackageTitle = styled(Box)`
    width: 100%;
    height: auto;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 20px;
    padding: 0 50px;
    padding-bottom: 20px;

    img {
        width: 35px;
        height: 35px;
        object-fit: contain;
    }

    h2 {
        font-family: Nunito Sans;
        font-weight: 600;
        font-size: 30px;
        line-height: 32px;
        color: #202224;
    }
`;

export const PackageCard = styled(Box)`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    max-width: 362px;
    width: 100%;
    height: auto;
    min-height: 250px;
    background: #FFFFFF;
    border: 0.3px solid #D5D5D5;
    border-radius: 12px 12px 24px 24px;
    padding-top: 30px;
`;