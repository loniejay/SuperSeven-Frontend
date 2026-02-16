import { Box, styled } from "@mui/material";

export const Filter = styled(Box)`
    display: flex;
    flex-direction: row;

    label, select {
        border: 0.6px solid #D5D5D5;
        background: #FFFFFF;
        padding: 20px 30px;
        font-family: Nunito Sans;
        font-weight: 700;
        font-size: 14px;
        line-height: 100%;
        letter-spacing: 0px;
        color: #202224;
        text-wrap: nowrap;
    }

    label {
        border-radius: 4px 0px 0px 4px;
    }

    select {
        appearance: none;
        border-left: none;
        border-radius: 0px 4px 4px 0px;
        width: 100%;
        min-width: 180px;
        cursor: pointer;
        padding: 20px 30px;

        &:focus-visible {
            outline: none;
            border: 0.6px solid #D5D5D5;
        }
    }
`;