import { Box, styled} from "@mui/material";

export const TotalBilling = styled(Box)`
    display: flex;
    flex-direction: row;
    gap: 40px;
`;

export const BillingBox = styled(Box)`
    display: flex;
    flex-direction: row;
    align-items: center;

    h3 {
        font-family: 'Nunito', sans-serif;
        font-size: 16px;
        letter-spacing: 0.01071em;
        line-height: 1.5rem;
        text-transform: uppercase;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.87);
        margin: 0;
    }

    span {
        display: inline-flex;
        gap: 4px;
        margin-left: 8px;
    }
`;

export const Heading = styled(Box)`
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