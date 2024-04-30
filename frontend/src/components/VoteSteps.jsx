import React from 'react';
import { Steps, ConfigProvider } from 'antd';

const { Step } = Steps;

const VoteSteps = ({ stepNow }) => {
  return (
    <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#38B56A',
      },
    }}
  >
    <Steps current={stepNow} className='pl-5 pr-5 pb-5'>
     
        <Step title="Create Vote" description="Create Your Vote." className='bg-[]' />
        <Step title="Voting" description="View Detail" />
    </Steps>
    </ConfigProvider>
  );
};

export default VoteSteps;
