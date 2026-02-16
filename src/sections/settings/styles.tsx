import { Box, styled } from "@mui/material";

export const Heading = styled(Box)`
    widht: 100%;

    h1 {
        font-family: Nunito Sans;
        font-weight: 700;
        font-size: 32px;
        line-height: 100%;
        letter-spacing: -0.11px;
        color: #202224;
    }
`;

export const FormContainer = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 0px;
    max-width: 1640px;
    width: 100%;
    height: 100%;
    margin-bottom: 150px;

    .wrapper {
        width: 100%;
        height: auto;
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 46px 56px;
        background: #FFFFFF;
        border: 0.3px solid #D5D5D5;
        border-radius: 14px;

        form {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 25px;

            .row {
                width: 100%;
                display: flex;
                flex-direction: row;
                gap: 20px;
                position: relative;
                transition: all 0.2s ease-in-out;

                @media (max-width: 900px) {
                    flex-direction: column !important;
                    transition: all 0.2s ease-in-out;
                }

                &.right {
                    justify-content: flex-end;
                    transition: all 0.2s ease-in-out;

                    @media (max-width: 900px) {
                        flex-direction: row !important;
                        justify-content: flex-start !important;
                        transition: all 0.2s ease-in-out;
                    }
                } 

                button {
                    appearance: none;
                    border: none;
                    border-radius: 6px;
                    width: fit-content;
                    height: fit-content;
                    font-weight: 500;
                    font-size: 14px;
                    line-height: 27px;
                    letter-spacing: 0px;
                    color: #FFFFFF;
                    padding: 10px 15px;
                    box-shadow: none;
                    text-transform: capitalize;
                    transition: all 0.2s ease-in-out;

                    &.cancel {
                        background: #AAAAAA;

                        &:hover {
                            background-color: #777777;
                            transition: all 0.2s ease-in-out;
                        }
                    }

                    &.update,
                    &.register {
                        background: #2BB673;

                        &:hover {
                            background-color: #155D3A;
                            transition: all 0.2s ease-in-out;
                        }
                    }
                }

                .form-group {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;

                    label {
                        font-weight: 500;
                        font-size: 14px;
                        line-height: 100%;
                        letter-spacing: 0px;
                        color: #ADADAD;
                    }

                    input[type="text"],
                    input[type="email"],
                    input[type="password"] {
                        width: 100%;
                        height: 52px;
                        background: #F7FAF5;
                        border-radius: 4px;
                        padding: 0 15px;
                        font-weight: 500;
                        font-size: 14px;
                        line-height: 100%;
                        letter-spacing: 0px;
                        color: #202224;
                    }

                    input[type="password"] {
                        padding-right: 50px;
                    }

                    .Mui-focused {
                        fieldset.MuiOutlinedInput-notchedOutline {
                            border-color: #202224 !important;
                        }
                    }
                }
            }
        }

        &.change-password {
            form {
                .row {
                    .form-group {
                        max-width: 50%;
                        width: 100%;
                        position: relative;
                        transition: max-width 0.2s ease-in-out;

                        @media (max-width: 1024px) {
                            max-width: 100%;
                            transition: max-width 0.2s ease-in-out;
                        }

                        input[type="text"],
                        input[type="password"] {
                            background: transparent;
                        }

                        button {
                            &:hover {
                                background: transparent;
                            }
                        }
                    }
                }
            }
        }
    }

    &.register-account {

        .wrapper {
            form {
                .filter {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;

                    label {
                        border: none;
                        border-radius: 0px;
                        padding: 0;
                        background: transparent;
                        font-weight: 500;
                        font-size: 14px;
                        line-height: 100%;
                        letter-spacing: 0px;
                        color: #ADADAD;
                    }

                    .select-list {
                        max-width: 200px;

                        select {
                            max-width: 200px;
                            border-radius: 4px;
                            background: #F7FAF5;
                            border: 0.6px solid #D5D5D5;
                            font-weight: 500;
                        }
                    }
                }
            }
        }
    }
`;

export const RightButton = styled('button')`
    width: 100%;
    border-radius: 0px 10px 10px 0px;
`;

export const LeftButton = styled('button')`
    width: 100%;
    border-radius: 10px 0px 0px 10px;
    border-right: none !important;
`;

export const ActionButton = styled(Box)`
    max-width: 1640px;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 0px;

    .btn {
        padding: 20px 25px;
        width: fit-content;
        hight: fit-content;
        font-weight: 500;
        font-size: 14px;
        line-height: 100%;
        letter-spacing: 0px;
        color: #000000;
        border: 0.6px solid #D5D5D5;
        cursor: pointer;
        background: #F9F9FB;

        &.active {
            background: #2BB673;
            color: #FFFFFF;
        }
    }

    .search-box {
        margin-left: 20px;
    }
`;

export const SettingsContainer = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 40px;
    position: relative;
    background-color: #f7faf5;
    height: 100%;
    overflow-y: scroll;
    scrollbar-width: none;
    padding: 0 30px;
`;