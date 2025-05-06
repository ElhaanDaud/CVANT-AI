import { SignUp } from "@clerk/nextjs";
import React from "react";

const Page = () => {
  return (
    <div className='flex items-center justify-center bg-gray-100'>
      <SignUp forceRedirectUrl={"/"} routing="hash" />
    </div>
  );
};

export default Page;
