import { Box, styled } from "@mui/material";

export const HeadingWrapper = styled(Box)`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    position: relative;
    background-color: #f7faf5;
    width: 100%;
    padding: 30px 0;
    border-bottom: 1px solid #E0E0E0;

    .title{
        font-family: 'Nunito', sans-serif;
        font-size: 32px;
        font-weight: 700;
        color: #202224;
        margin: 0;
    }

    button {
        appearance: none;
        border: none;
        box-shadow: none;
        background-color: transparent;
        font-family: 'Nunito', sans-serif;
        font-size: 16px;
        font-weight: 500;
        color: #FFFFFF;
        cursor: pointer;
        text-transform: capitalize;
        background-color: #2BB673;
        padding: 10px 20px;
        border-radius: 6px;

        &:hover {
            background-color: #155D3A;
        }
    }
`;

export const DropdownMonth = styled(Box)`
    width: 100%;
    height: auto;
    display: flex;
    align-items: center;
    flex-direction: column;

    p {
        width: 100%;
        font-family: Nunito Sans;
        font-weight: 600;
        font-size: 15px;
        color: #202224;
        text-align: center;
        border-top: 0.3px solid #D5D5D5;
        margin: 0;
        padding: 10px;

        &:hover {
            background-color: #F5F5F5;
        }
    }
`;

export const YearBox = styled(Box)`
    width: 100%;
    height: auto;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    gap: 20px;

    p {
        font-family: Nunito Sans;
        font-weight: 600;
        font-size: 15px;
        color: #202224;
        margin: 0;
        padding: 0;
    }

    div {
        display: flex;
        gap: 5px;
        align-items: center;

        img {
            width: px;
            height: auto;
            object-fit: contain;
            background-color: #E7E9EE;
            padding: 5px;
            border-radius: 4px;
        }
    }
`;

export const DropdownList = styled(Box)`
    max-width: 150px;
    width: 100%;
    height: auto;
    box-shadow: 0px 13px 61px 0px #A9A9A95D;
    border-radius: 10px;
    padding: 0;
    background-color: #FFFFFF;
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 35px;
    left: 0px;
    z-index: 10;
`;

export const SelectBox = styled(Box)`
    width: 100%;
    height: auto;
    box-shadow: 0px 13px 61px 0px #A9A9A95D;
    border: .6px solid #d5d5d5;
    border-radius: 4px;
    padding: 10px 20px;
    background-color: #FFFFFF;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-left: auto;

    p {
        font-family: Nunito Sans;
        font-weight: 500;
        font-size: 15px;
        color: #202224;
        margin: 0;
        padding: 0;
    }

    img {
        width: 15px;
        height: auto;
        object-fit: contain;
    }
`;

export const PackageBar = styled(Box)`
    width: 100%;
    height: auto;
`;

export const YearDropdown = styled(Box)`
    position: relative;
    max-width: 200px;
    width: 100%;
    cursor: pointer;

    .form {
        .select {
            width: fit-content !important;
            font-family: Nunito Sans;
            font-weight: 500;
            font-size: 16px;
            line-height: 10px;
            // color: #2B303466;
            height: 40px;
            box-shadow: 0px 13px 61px 0px #A9A9A95D;
            border-radius: 4px;
            padding: 10px 20px;

            div.MuiSelect-select {
                padding: 0 !important;
                width: fit-content !important;
                padding-right: 10px !important;
            }

            .menu-item {
                font-family: Nunito Sans;
                font-weight: 600;
                font-size: 12px;
                line-height: 10px;
                color: #2B303466;
            }
        }
    }
`;

export const Heading = styled(Box)`
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    p {
        padding: 0;
        margin: 0;
        font-family: Nunito Sans;
        font-weight: 700;
        font-size: 24px;
        leading-trim: NONE;
        line-height: 100%;
        letter-spacing: 0px;
        text-align: left;
        color: #000000;
    }
`;

export const BoxWrapper = styled(Box)`
    max-width: 1640px;
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    background-color: #FFFFFF;
    border: 0.3px solid #E0E0E0;
    border-radius: 6px;
    padding: 30px;
`;