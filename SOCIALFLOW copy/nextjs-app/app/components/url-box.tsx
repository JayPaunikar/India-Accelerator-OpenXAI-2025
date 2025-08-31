"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";

const UrlInput: React.FC = () => {
  const [url, setUrl] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const urlPattern =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    const disallowedKeywords = /(sex|porn|adult|xxx)/i;

    

    if (!url) {
      return toast.error("Please enter your link");
    }

    if (!urlPattern.test(url)) {
      return toast.error("Invalid URL. Please enter a valid link.");
    }

    if (disallowedKeywords.test(url)) {
      return toast.error(
        "URL contains disallowed content. Please enter a different link."
      );
    }

    toast.success("✅ URL is valid!");
    console.log("Valid URL:", url);
  };

  return (
    <div className="flex flex-col justify-center items-center w-full my-10 space-y-5">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-full max-w-2xl space-y-4"
      >
        <input
          type="text"
          value={url}
          onChange={handleInputChange}
          placeholder="Paste your link here"
          className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
        <button
          type="submit"
          className="w-fit px-10 py-2 text-white bg-black rounded-full hover:bg-gray-900 focus:outline-none"
        >
          Validate Link
        </button>
      </form>
    </div>
  );
};

export default UrlInput;