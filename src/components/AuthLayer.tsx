import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { LoadingOverlay } from "@mantine/core";

const AuthLayer = ({ children: Component }: any) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session && status !== "loading") {
      router.replace(`/authorize?to=${router ? router.asPath : "/"}`);
    }
  }, [session, status]);

  if (session && status === "authenticated") {
    return <>{Component}</>;
  }

  return (
    <LoadingOverlay
      style={{ width: "100vw", height: "100vh" }}
      loaderProps={{ variant: "bars" }}
      visible={true}
      overlayBlur={2}
    />
  );
};

export default AuthLayer;
