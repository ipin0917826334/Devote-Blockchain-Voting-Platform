import React from 'react';
import { Carousel, Typography, Divider } from 'antd';

const { Title, Paragraph } = Typography;

const Home = () => {
  return (
    <div className='p-10 bg-[#20414F]'>
         <Typography className='bg-[#DEE9EF] p-10 shadow rounded-lg border-2'>
        <Title>Welcome to DeVote -  Voting Platform</Title>
        <Paragraph className='p-5' >
        DeVote Voting Platform is a web application designed to leverage blockchain technology to create an online voting system that is transparent and immutable, unlike traditional paper-based voting systems, which can lead to non-transparency. This project has three primary objectives: to understand the workings of blockchain, to develop a transparent voting system, and to create a versatile voting platform. The voting system offers a range of features, including user registration, data validation, vote creation with customizable details, vote participation, display result, save voting result into blockchain, blockchain-based vote verification, access to vote history, and a user feedback system. The system also focuses on security and stability, with the aim of making the system accessible even to users with limited technical knowledge. This project serves as a valuable learning opportunity for studying blockchain technology, improving programming skills, and building a voting system that prioritizes transparency and security.

        </Paragraph>
      </Typography>

      <Divider />
      {/* Carousel Section */}
      <Carousel autoplay >
        <div style={{ height: '650px', overflow: 'hidden' }}>
          <img src="https://www.aclu-in.org/sites/default/files/styles/hero_big_wide_1200x530/public/field_banner_image/yycv_web_header_0.jpg?itok=Dg6y_yem" alt="Slide 1 Description" style={{ width: '100%', height: '650px', objectFit: 'cover' }} />
        </div>
        <div style={{ height: '650px', overflow: 'hidden' }}>
          <img src="https://static.thairath.co.th/media/dFQROr7oWzulq5Fa5BEe06sJecnv6mFWutOB9W6PRySXKEGNEmlA4u3pht4brkuJKeO.jpg" alt="Slide 2 Description" style={{ width: '100%', height: '650px', objectFit: 'cover' }} />
        </div>
        <div style={{ height: '650px', overflow: 'hidden' }}>
          <img src="https://gems.peralta.edu/hubfs/Vote-Graphic-03.jpg" alt="Slide 3 Description" style={{ width: '100%', height: '650px', objectFit: 'cover' }} />
        </div>
      </Carousel>

      <Divider />

      {/* Description Section */}
    </div>
  );
};

export default Home;
