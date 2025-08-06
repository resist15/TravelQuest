"use client";

import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <p className="text-lg mb-6">
        We'd love to hear from you! Whether it's feedback, questions, or just a hello — reach out to us.
      </p>

      <ul className="space-y-4 text-lg">
        <li className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <span><strong>Email:</strong> support@travelquest.com</span>
        </li>
        <li className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-muted-foreground" />
          <span><strong>Phone:</strong> +91 98765 43210</span>
        </li>
        <li className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <span><strong>Address:</strong> CDAC Innovation Park, Pune, Maharashtra</span>
        </li>
      </ul>
    </main>
  );
}

