import type { NextPage } from 'next';
import AuthLayer from '@/components/AuthLayer';
import useUser from '@/hooks/useUser';
import { Center, Code } from '@mantine/core';
import { useEffect } from 'react';

const Home: NextPage = () => {
  const user = useUser();

  console.log(user);

  return (
    <>
      <AuthLayer>to kaisa laga mera majak</AuthLayer>
    </>
  );
};

export default Home;
