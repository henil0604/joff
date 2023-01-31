import { Center, LoadingOverlay, Text, Button } from '@mantine/core';
import { IconBrandGithub, IconBrandGoogle } from '@tabler/icons';
import type { NextPage } from 'next';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const ContinueWithGoogle = () => {
  const router = useRouter();

  const to = router.query.id?.toString();

  const handleClick = () => {
    signIn('google', {
      callbackUrl: to ?? '/',
    });
  };

  return (
    <>
      <Button
        onClick={handleClick}
        leftIcon={<IconBrandGoogle />}
        variant="default"
        color="gray"
      >
        Continue with Google
      </Button>
    </>
  );
};

const Authorize: NextPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.replace(router?.query?.id?.toString() || '/');
    }
  }, [router]);

  if (sessionStatus === 'loading') {
    return (
      <LoadingOverlay
        loaderProps={{ variant: 'bars' }}
        style={{ width: '100vw', height: '100vh' }}
        visible={true}
        overlayBlur={2}
      />
    );
  }

  return (
    <Center
      style={{ width: '100vw', height: '100vh', flexDirection: 'column' }}
    >
      <ContinueWithGoogle />
    </Center>
  );
};

export default Authorize;
