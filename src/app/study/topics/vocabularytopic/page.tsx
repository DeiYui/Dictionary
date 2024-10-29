import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next";
import React from "react";
import VocabularyTopic from "./VocabularyTopic";

export const metadata: Metadata = {
  title: "LearnVocabulary - Dictionary",
  description: "LearnVocabulary page for We_sign",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/favicon.ico",
        href: "/favicon.ico",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/favicon.ico",
        href: "/favicon.ico",
      },
    ],
  },
};

const LearnVocabulary = () => {
  return (
    <DefaultLayout>
      <VocabularyTopic />
    </DefaultLayout>
  );
};

export default LearnVocabulary;
