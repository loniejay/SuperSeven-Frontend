import { Box, styled} from "@mui/material";

export const PostCard = styled(Box)`
    // max-width: 300px;
    width: auto;
    height: auto;
    min-height: 250px;
    padding: 30px;
    border-radius: 8px;
    background: #FFFFFF;
    box-shadow: 0px 3.8px 22.82px 0px rgba(36, 124, 206, .05);

    .quote-icon {
        width: 100%;
        svg {
            width: 50px;
            height: 50px;
            object-fit: contain;
            display: block;
            margin: auto;

            path {
                fill: #2BB673;
            }
        }
    }

    .feedback-details {
        width: 100%;
        height: auto;
        margin-top: 20px;
        margin-bottom: 20px;
        
        p {
            display: block;
            font-family: 'Nunito Sans';
            font-weight: 400;
            font-size: 16px;
            line-height: 24px;
            text-align: center;
            color: #242424;
            opacity: 0.8;
        }
    }

    .event-name {
        width: 100%;
        height: auto;
        
        span {
            display: block;
            font-family: 'Nunito Sans';
            font-weight: 700;
            font-size: 18px;
            line-height: 100%;
            text-align: center;
            color: #242424;
        }
    }
`;

export const FeedbackList = styled(Box)`
    max-width: 1640px;
    width: 100%;
    height: auto;

    .swiper {
        width: 100%;
        height: auto;
        min-height: 400px;

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
    }
`;

export const FeedbackContent = styled(Box)`
    width: 100%;
    height: auto;
`;

export const Heading = styled('p')`
    width: 100%;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Nunito Sans';
    font-weight: 700;
    font-size: 45px;
    line-height: 100%;
    color: #242424;
    padding: 0;
    margin: auto;

    span {
        font-family: 'Nunito Sans';
        font-weight: 700;
        font-size: 45px;
        line-height: 100%;
        color: #2BB673;
        margin-left: 8px;
    }
`;

export const FeedbackPostWrapper = styled(Box)`
    max-width: 1640px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 50px;
    padding: 100px 0;
`;

export const AnimatedBox = styled(Box)<{ delay: number }>`
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 0.5s ease-out forwards;
  animation-delay: ${props => props.delay}s;

  @keyframes fadeUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const ArrowRight = styled(Box)`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 41px;
    height: 41px;
    border-radius: 50%;
    opacity: 0.73;
    background: #F4F4F4;
    cursor: pointer;
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;

    &:hover {
        opacity: 0.5;
    }

    img {
        width: 12px;
        height: auto;
        object-fit: contain;
    }
`;

export const ArrowLeft = styled(Box)`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 41px;
    height: 41px;
    border-radius: 50%;
    opacity: 0.73;
    background: #F4F4F4;
    cursor: pointer;
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;

    &:hover {
        opacity: 0.5;
    }


    img {
        width: 12px;
        height: auto;
        object-fit: contain;
    }
`;

export const ArrowButton = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 0 24px;
    z-index: 1;

`;

export const BoxWithShadow = styled(Box)`
    position: absolute;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.85) 34.38%, rgba(255, 255, 255, 0.95) 100%);
    backdrop-filter: blur(4px);
    width: 100%;
    height: 25%;
    bottom: 0;
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 17px 20px;
    border-radius: 0px 0px 19px 19px;

    h2 {
        font-family: 'Nunito Sans';
        font-weight: 700;
        font-size: 18px;
        line-height: 20px;
        letter-spacing: 0px;
        color: #202224;
    }

    .btn {
        font-family: 'Nunito Sans';
        font-weight: 500;
        font-size: 14px;
        line-height: 28px;
        letter-spacing: 1px;
        text-transform: capitalize;
        color: #FFFFFF;
        width: fit-content;
        height: auto;
        padding: 8px 23px;
        border-radius: 11px;
        background: #2BB673;

        &:hover {
            background: #155D3A;
        }
    }
`;

export const BoxContent = styled(Box)`
    width: 100%;
    max-height: 430px;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: absolute;
    padding: 80px 150px;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2;

    .date-now {
        font-family: 'Nunito Sans';
        font-weight: 500;
        font-size: 16px;
        line-height: 30px;
        color: #FFFFFF;
    }

    h1 {
        max-width: 555px;
        width: 100%;
        font-family: 'Nunito Sans';
        font-weight: 900;
        font-size: 37px;
        line-height: 48px;
        letter-spacing: 0px;
        color: #FFFFFF;
    }

    p {
        font-family: 'Nunito Sans';
        font-weight: 500;
        font-size: 16px;
        line-height: 30px;
        letter-spacing: 0px;
        color: #FFFFFF;
        opacity: 0.8;
    }

    .btn {
        font-family: 'Nunito Sans';
        font-weight: 500;
        font-size: 14px;
        line-height: 28px;
        letter-spacing: 1px;
        text-transform: capitalize;
        color: #FFFFFF;
        width: fit-content;
        height: auto;
        padding: 8px 23px;
        border-radius: 11px;
        background: #2BB673;
        margin-top: 22px;
        cursor: pointer;

        &:hover {
            background: #155D3A;
        }
    }
`;

export const HomeContentContainer = styled(Box)`
    max-width: 1640px;
    display: flex;
    margin-bottom: 150px;
    background-color: #f7faf5;
`;

export const ImageContainer = styled(Box)`
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 40px;

    @media (max-width: 1024px) {
        flex-direction: column;
        gap: 20px;
    }
`;

export const TopImageContainer = styled(Box)`
    display: flex;
    width: 100%;
    max-height: 430px;
    min-height: 430px;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    position: relative;
    border-radius: 19px;
    position: relative;

    @media (max-width: 1024px) {
        min-height: unset;
        max-height: unset;
    }

    .swiper {
        width: 100%;
        max-height: 430px;
        height: 100%;

        .swiper-wrapper {
            width: 100%;
            height: 100%;

            .swiper-slide {
                width: 100% !important;
                height: 100%;

                .image-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    height: auto;

                    img {
                        width: 100% !important;  
                        max-height: 430px;
                        height: 100%;
                        object-fit: cover;
                        border-radius: 19px;
                    }
                }
            }
        }
    }
`;

export const SlideContent = styled(Box)`

    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: auto;

    img {
        width: 100% !important;  
        max-height: 430px;
        height: 100%;
        object-fit: cover;
        border-radius: 19px;
    }
`;

export const BottomImageContainer = styled(Box)`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
    width: auto;
    height: 100%;
    min-height: 496px;
    max-height: 498px;

    @media (max-width: 1024px) {
        display: flex;
        min-height: unset;
        max-height: unset;
        flex-direction: column;
        gap: 20px;
    }
`;

export const BottomImageContent = styled(Box)`
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    position: relative;
    border-radius: 19px;

    @media (max-width: 1024px) {
        min-height: 300px;
    }

    img{
        // width: 100%;
        // height: 100%;
        object-fit: cover;
        border-radius: 19px;
    }
`;
