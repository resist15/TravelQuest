"use client";

import { ShieldCheck, Info, ClipboardList, Settings, HeartHandshake } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
        <ShieldCheck className="w-6 h-6" />
        Privacy Policy
      </h1>

      <p className="mb-4 text-lg">
        At TravelQuest, we are committed to protecting your privacy. This policy outlines what information we collect, how we use it, and your rights.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2 flex items-center gap-2">
        <Info className="w-5 h-5" />
        Information We Collect
      </h2>
      <ul className="list-disc ml-6 text-lg mb-4">
        <li className="flex items-start gap-2">
          <ClipboardList className="w-5 h-5 mt-1" />
          Your name and email when you register
        </li>
        <li className="flex items-start gap-2">
          <ClipboardList className="w-5 h-5 mt-1" />
          Your uploaded travel photos and collection details
        </li>
        <li className="flex items-start gap-2">
          <ClipboardList className="w-5 h-5 mt-1" />
          Technical data such as IP address and browser info
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2 flex items-center gap-2">
        <Settings className="w-5 h-5" />
        How We Use Your Data
      </h2>
      <ul className="list-disc ml-6 text-lg mb-4">
        <li className="flex items-start gap-2">
          <ClipboardList className="w-5 h-5 mt-1" />
          To personalize your travel dashboard
        </li>
        <li className="flex items-start gap-2">
          <ClipboardList className="w-5 h-5 mt-1" />
          To improve our platform’s performance
        </li>
        <li className="flex items-start gap-2">
          <ClipboardList className="w-5 h-5 mt-1" />
          To provide customer support
        </li>
      </ul>

      <p className="text-lg flex items-center gap-2">
        <HeartHandshake className="w-5 h-5" />
        We never sell your personal data. Your privacy matters to us.
      </p>
    </main>
  );
}

