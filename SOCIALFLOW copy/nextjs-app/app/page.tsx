"use client";

// import Image from "next/image";
import UrlInput from "./components/url-box";
// import { useRouter } from "next/navigation";
// import LogoIcon from "../../images/link.png"; // adjust the path based on your folder structure

export default function Logo() {
  // const router = useRouter();

  return (
    <div
      // onClick={() => router.push("/")}
      className="flex space-x-4 items-center cursor-pointer"
    >
      {/* <Image
        src={""}
        alt="logo"
        width={40}
        height={40}
        className="w-10 h-10"
      /> */}
      <p className="font-bold text-4xl">Linker</p>
      <UrlInput />
    </div>
  );
}