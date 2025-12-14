import Signin from "@/components/Auth/SignIn";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Sign In | Property",
};

const SigninPage = () => {
  return (
    <>
      <Breadcrumb pageName="Sign In Page" />

    {/* This page renders Signin as a standalone page (not a modal). The Signin component
      accepts an optional onClose handler for modal flows, so when rendering as a full
      page we don't need to pass one. */}
    <Signin />
    </>
  );
};

export default SigninPage;
