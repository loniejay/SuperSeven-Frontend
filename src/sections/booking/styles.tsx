import { Box, styled } from "@mui/material";

export const CloseButton = styled(Box)`
    position: absolute;
    top: 20px;
    right: 20px;
    cursor: pointer;
`;

export const Details = styled(Box)`
    max-width: 354px;
    width: 100%;
    height: auto;
    padding: 30px;
    background: #FFFFFF;
    border: 0.3px solid #E0E0E0;
    border-radius: 25px;
    box-shadow: 0px 12.66px 59.41px 0px #A9A9A95D;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    .reschedule-form {
        .time-picker {
            .form-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
        }
    }

    .event-head {
        display: flex;
        flex-direction: row;

        &.unassigned {
            .event-icon {
                background: #9CA3AF;
            }
        }

        &.scheduled {
            .event-icon {
                background: #EF3826;
            }
        }

        &.uploaded {
            .event-icon {
                background: #FACC15;
            }
        }
        
        &.for-edit,
        &.editing {
            .event-icon {
                background: #FF7B00;
            }
        }
        
        &.completed {
            .event-icon {
                background: #2BB673;
            }
        }

        .event-icon {
            width: 12px;
            height: 12px;
            background: #FF7B00;
            border-radius: 50%;
            margin-right: 20px;
            margin-top: 7px;
        }

        .event-name {
            display: flex;
            flex-direction: column;
            gap: 15px;

            h2 {
                font-family: Nunito Sans;
                font-weight: 700;
                font-size: 20px;
                color: #202224;
            }

            .event-date {
                font-family: Nunito Sans;
                font-weight: 500;
                font-size: 15px;
                color: #828282;
            }
        }
    }
    
    .client-info {
        width: 100%;
        height: auto;
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-top: 20px;

        img {
            margin-right: 20px;
            width: 20px;
            height: 20px;
            object-fit: contain;
        }

        span {
            font-family: Nunito Sans;
            font-weight: 500;
            font-size: 16px;
            color: #828282;
        }
    }

    .action-btn {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        gap: 10px;
        padding-top: 30px;

        &.approved {
            justify-content: flex-end;
        }

        .btn {
            width: fit-content;
            height: auto;
            padding: 8px 12px;
            border-radius: 6px;
            font-family: Nunito Sans;
            font-weight: 500;
            font-size: 16px;
            text-transform: capitalize;
            color: #FFFFFF;

            &.reschedule {
                background: #EFC026;
            }

            &.reject {
                background: #EF3826;
            }

            &.cancel {
                background: #979797;
            }

            &.approve {
                background: #2BB673;
            }

            &.update {
                background: #3085d6;
            }
        }
    }
`;

export const BookingWrapper = styled(Box)`
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    gap: 30px;
    padding: 50px;
    background: #FFFFFF;
    border: 0.3px solid #E0E0E0;
    border-radius: 14px;
    margin-bottom: 150px;

    form {

        .form-wrapper{
            display: flex;
            gap: 20px;
            
            &.add-account {

                .form-row {
                    .row {
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

            .form-row {
                .form-group {
                    div {
                        .dropdown-search {
                            div {
                                input {
                                    border: none;
                                    padding: 0 1px;
                                }
                            }
                        }
                    }
                }
            }

            @media (max-width: 900px) {
                flex-direction: column !important;

                .form-row {
                    width: 100% !important;
                }
            }

            .row.col-2 {
                @media (max-width: 1400px) {
                    flex-direction: column !important;
                }
            }
        }

        .form-container {
            display: flex;
            gap: 20px;
            flex-direction: column;
            width: 60%;
            height: auto;

            @media (max-width: 1024px) {
                width: 100%;
            }
        }

        .date-time-picker {
            @media (max-width: 1230px) {
                flex-direction: column;
            }
        }

        .form-group {
            width: 100%;
            display: flex;
            flex-direction: column;

            .form-label {
                margin-bottom: 10px;
            }

            .date-picker,
            .time-picker {
                div.MuiPickersOutlinedInput-root {
                    width: 100%;
                    height: 48px;
                    background: #F7FAF5;
                }
            }

            .package-dropdown {
                width: 100%;
                height: 48px;
                background: #F7FAF5;
            }

            .dropdown-options {
                width: 100%;
                height: 200px;
                overflow: auto;
                scrollbar-width: thin;
                scrollbar-behavior: smooth;
                scrollbar-color: #D5D5D5 #FAFBFD;
                background: #F7FAF5;
                margin-top: -1px;
                border-radius: 4px;
                border: 0.6px solid #D5D5D5;
                
                .dropdown-item {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    border-bottom: 0.6px solid #D5D5D5;

                    &:hover {
                        cursor: pointer;
                        background: #D5D5D5;
                    }

                    &:last-of-type {
                        border-bottom: none;
                    }
                    
                    p {
                        font-family: Nunito Sans;
                        font-weight: 400;
                        font-size: 14px;
                        line-height: 100%;
                        letter-spacing: 0px;
                        color: #202224;
                        padding: 0;
                        margin: 0;

                        .package-name {
                            font-weight: 600;
                        }

                        .package-details {
                            font-weight: 400;
                            font-size: 12px;
                            line-height: 100%;
                            letter-spacing: 0px;
                            color: #828282;
                        }

                        .package-price {
                            font-weight: 600;
                            font-size: 14px;
                            line-height: 100%;
                            letter-spacing: 0px;
                            color: #202224;
                        }
                    }
                }
            }

            label, .form-label {
                color: #ADADAD;
            }

            input[type="text"],
            input[type="email"],
            input[type="password"] {
                width: 100%;
                height: 46px;
                background: #F7FAF5;
                border: 0.6px solid #D5D5D5;
                border-radius: 4px;
                padding: 0 15px;
                font-weight: 400;
                font-size: 14px;
                line-height: 100%;
                letter-spacing: 0px;
                color: #202224;
            }

            fieldset {
                border: 0.6px solid #D5D5D5;
            }

            .dropdown-list {
                width: 100%;
                height: 120px;
                overflow: auto;
                scrollbar-width: thin;
                scrollbar-color: #D5D5D5 #FAFBFD;
                display: flex;
                flex-direction: column;
                border-radius: 4px;
                border: 0.6px solid #D5D5D5;
                background: #F7FAF5;
                margin-top: -10px;

                &.addon-list {
                    padding: 0!important;
                    height: auto;
                    max-height: 200px;
                    margin-top: 0px;
                }

                .addon-item.row {
                    padding: 12px;

                    input[type="checkbox"] {
                        display: none;
                    }

                    label {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        position: relative;
                        padding-top: 4px;
                        padding-left: 30px;
                        cursor: pointer;
                        user-select: none;

                        p, span {
                            font-family: 'Nunito Sans';
                            font-weight: 600;
                            font-size: 14px;
                            line-height: 100%;
                            letter-spacing: 0px;
                            color: #202224;
                            margin: 0;
                            padding: 0;

                            &.addon-details {
                                font-weight: 400;
                                font-size: 12px;
                                color: #828282;
                            }

                            &.addon-price {
                                font-weight: 600;
                                font-size: 14px;
                                color: #202224;
                            }
                        }
                    }

                    label::before {
                    content: '';
                        position: absolute;
                        left: 0;
                        top: 0px;
                        width: 20px;
                        height: 20px;
                        background-color: white;
                        border: 1px solid #000;
                        border-radius: 2px;
                        box-sizing: border-box;
                        transition: all 0.2s ease;
                    }

                    input[type="checkbox"]:checked + label::after {
                        content: '';
                        position: absolute;
                        left: 7px;
                        top: 3px;
                        width: 4px;
                        height: 10px;
                        border: solid black;
                        border-width: 0 2px 2px 0;
                        transform: rotate(45deg);
                    }
                }

                .row {
                    padding: 20px 20px;
                    cursor: pointer;

                    &:hover {
                        background-color: #D5D5D5;
                    }

                    span {
                        font-family: Nunito Sans;
                        font-weight: 400;
                        font-size: 14px;
                        line-height: 100%;
                        letter-spacing: 0px;
                        color: #202224;
                    }

                    .checkbox {
                        width: 100%;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        gap: 10px;

                        input[type="checkbox"] {
                            display: none;
                        }

                        label {
                            position: relative;
                            padding-left: 30px;
                            cursor: pointer;
                            user-select: none;
                            font-family: Nunito Sans;
                            font-weight: 400;
                            font-size: 14px;
                            line-height: 100%;
                            letter-spacing: 0px;
                            color: #202224;
                        }

                        label::before {
                        content: '';
                            position: absolute;
                            left: 0;
                            top: -4px;
                            width: 20px;
                            height: 20px;
                            background-color: white;
                            border: 1px solid #000;
                            border-radius: 2px;
                            box-sizing: border-box;
                            transition: all 0.2s ease;
                        }

                        input[type="checkbox"]:checked + label::after {
                            content: '';
                            position: absolute;
                            left: 7px;
                            top: -1px;
                            width: 4px;
                            height: 10px;
                            border: solid black;
                            border-width: 0 2px 2px 0;
                            transform: rotate(45deg);
                        }
                    }
                }

                .row + .row {
                    border-top: 1px solid #ccc;
                }
            }
        }
    }
`;

export const AddBookingContainer = styled(Box)`
    max-width: 1640px;
    width: 100%;
    height: auto;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    gap: 30px;

    &.edit-booking-container {
        display: flex;
        flex-direction: column;
        gap: 40px;
        position: relative;
        background-color: #f7faf5;
        height: 100%;
        overflow-y: scroll;
        scrollbar-width: none;
        padding: 0 30px;
    }
`;

export const BigCalendar = styled(Box)`
    flex: 1;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    border: 0.3px solid #E0E0E0;
    height: 100%;
    overflow: auto;
    
    @media (max-width: 768px) {
        margin-left: 0;
        margin-top: 20px;
        height: auto;
    }
`;

export const EventDetails = styled(Box)`
    width: 100%;
    background: #F7FAF5;
    border: 0.6px solid #D5D5D5;
    border-radius: 10px;
    padding: 16px 26px 26px 26px;
    margin-top: 15px;
    margin-bottom: 15px;

    ul {
        list-style: disc;
        position: relative;

            &:before {
                content: "";
                position: absolute;
                top: 10px;
                left: 0;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background:rgb(230, 6, 6);
            }

        li {
            display: flex;
            flex-direction: column;
            gap: 0px;
            padding-left: 25px;
            padding-top: 2px;

            .label {
                font-family: Nunito Sans;
                font-weight: 700;
                font-size: 14px;
                line-height: 26px;
                letter-spacing: 0px;
                color: #202224;
            }

            .date,
            .package-type,
            .venue {
                font-family: Nunito Sans;
                font-weight: 500;
                font-size: 12px;
                line-height: 26px;
                letter-spacing: 0px;
                color: #202224;
            }
        }
    }
`;

export const EventHeading = styled('h2')`
    font-family: Nunito Sans;
    font-weight: 700;
    font-size: 14px;
    line-height: 100%;
    letter-spacing: 0px;
    color: #202224;
`;

export const StatusFilter = styled(Box)`
    width: 100%;
    background: #F7FAF5;
    border: 0.6px solid #D5D5D5;
    border-radius: 10px;
    margin-top: 20px;
    margin-bottom: 20px;
    border-bottom: 0.6px solid #D5D5D5;

    .status {
        padding: 16px 26px;

        label {
            font-family: Nunito Sans;
            font-weight: 700;
            font-size: 14px;
            line-height: 100%;
            letter-spacing: 0px;
            color: #202224;
        }
    }

    .dropdown-checkbox {
        display: none;
        flex-direction: column;
        gap: 10px;
        border-top: 0.6px solid #D5D5D5;
        padding: 16px 26px;

        &.open {
            display: flex;
        }

        .checkbox-container {
            input[type="checkbox"] {
                &:checked {
                    border: 2px solid #000000 !important;
                }
            }

            svg {
                path {
                    fill: #000000;
                }
            }

            label {
                font-family: Nunito Sans;
                font-weight: 500;
                font-size: 14px;
                line-height: 100%;
                letter-spacing: 0px;
                color: #202224;
            }
        }
    }
`;

export const CalendarWrapper = styled(Box)`
    width: 100%;

    > .MuiSvgIcon-root {
        background: #2BB673;
    }
`;

export const AddBooking = styled(Box)`
    width: 100%;

    @media (max-width: 1200px) {
        max-width: 300px;
    }

    @media (max-width: 768px) {
        max-width: 100%;
    }
    
    .add-booking-link {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 40px;
        background: #2BB673;
        border-radius: 8px;
        padding: 12px 16px;
        color: #fff;
        font-weight: 500;
        font-size: 14px;
        line-height: 100%;
        transition: all 0.2s ease-in-out;

        &:hover {
            background-color: #155D3A;
            transition: all 0.2s ease-in-out;
        }

        svg {
            path {
                fill: #fff;
            }
        }
    }
`;

export const LeftContent = styled(Box)`
    max-width: 350px;
    width: 100%;
    height: auto;
    background: #FFFFFF;
    border: 0.3px solid #E0E0E0;
    border-radius: 14px;
    padding: 24px;

    @media (max-width: 1200px) {
        max-width: fit-content;
        display: flex;
        flex-direction: row;
        gap: 20px;
    }

    @media (max-width: 768px) {
        flex-direction: column;
    }

    .upcoming-event {
        border-top: 1px solid #E0E0E0;
        padding-top: 20px;

        @media (max-width: 1200px) {
            border: none;
        }
    }

    .horizontal-rule {
        margin: 15px 0;
    }
`;

export const BookingContent = styled(Box)`
    max-width: 1640px;
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 20px;
    margin-bottom: 150px;

    @media (max-width: 1200px) {
        flex-direction: column;
    }
`;

export const BookingContainer = styled(Box)`
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