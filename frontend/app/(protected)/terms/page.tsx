"use client";

import {
  FileText,
  UserCheck,
  ShieldAlert,
  LockKeyhole,
  Copyright,
  RefreshCcw
} from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
        <FileText className="w-6 h-6" />
        Terms of Service
      </h1>

      <p className="text-lg mb-4">
        Welcome to TravelQuest! By using our platform, you agree to the following terms and conditions.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2 flex items-center gap-2">
        <UserCheck className="w-5 h-5" />
        Usage
      </h2>
      <ul className="list-disc ml-6 text-lg mb-4">
        <li className="flex items-start gap-2">
          <ShieldAlert className="w-5 h-5 mt-1" />
          You must be at least 13 years old to use TravelQuest.
        </li>
        <li className="flex items-start gap-2">
          <ShieldAlert className="w-5 h-5 mt-1" />
          Do not upload harmful, illegal, or abusive content.
        </li>
        <li className="flex items-start gap-2">
          <LockKeyhole className="w-5 h-5 mt-1" />
          You are responsible for maintaining your account security.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2 flex items-center gap-2">
        <Copyright className="w-5 h-5" />
        Copyright
      </h2>
      <p className="text-lg mb-4 flex items-start gap-2">
        <FileText className="w-5 h-5 mt-1" />
        You retain ownership of your uploaded content. However, by uploading, you grant us permission to display it on the platform.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2 flex items-center gap-2">
        <RefreshCcw className="w-5 h-5" />
        Changes
      </h2>
      <p className="text-lg flex items-start gap-2">
        <RefreshCcw className="w-5 h-5 mt-1" />
        We may update these terms from time to time. Continued use of the platform implies your agreement with the updated terms.
      </p>
    </main>
  );
}
