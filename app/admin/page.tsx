import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/admin-session";
import { isEbookAccessLive } from "@/lib/ebook-session";
import {
  getContactSubmissions,
  getDonations,
  getAllEbookAccess,
  getPrograms,
  getBooks,
} from "@/lib/sanity/queries";
import { sanityWriteClient } from "@/lib/sanity/client";
import { DataTable } from "@/components/admin/DataTable";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { AddBookForm } from "@/components/admin/AddBookForm";
import { SiteMediaForm } from "@/components/admin/SiteMediaForm";
import { ProgramPhotoUploader } from "@/components/admin/ProgramPhotoUploader";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false },
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isValid = verifyAdminSession(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
  if (!isValid) redirect("/admin/login");

  const [submissions, donations, ebookAccess, programs, books] = await Promise.all([
    getContactSubmissions(),
    getDonations(),
    getAllEbookAccess(),
    getPrograms(),
    getBooks(),
  ]);
  const realPrograms = programs.filter((p) => !p._id.startsWith("fallback-"));

  const totalRaisedKes = donations.reduce((sum, d) => sum + (d.amountKes ?? 0), 0);
  const activeAccessCount = ebookAccess.filter((a) => isEbookAccessLive(a)).length;

  const submissionRows = submissions.map((s) => ({
    name: s.name,
    email: s.email,
    phone: s.phone || "—",
    interest: s.interest || "—",
    message: s.message.length > 80 ? `${s.message.slice(0, 80)}…` : s.message,
    submittedAt: new Date(s.submittedAt).toLocaleString(),
  }));

  const donationRows = donations.map((d) => ({
    donorName: d.donorName || "Anonymous",
    donorEmail: d.donorEmail || "—",
    amountKes: d.amountKes ? `KSh ${d.amountKes.toLocaleString()}` : "—",
    kind: d.kind === "book_purchase" ? "Book Purchase" : "Donation",
    bookTitle: d.bookTitle || "—",
    reference: d.reference || "—",
    paidAt: d.paidAt ? new Date(d.paidAt).toLocaleString() : "—",
  }));

  const ebookAccessRows = ebookAccess.map((a) => ({
    buyerEmail: a.buyerEmail,
    book: a.book.title || a.book.slug || "—",
    status: a.revoked ? "Revoked" : isEbookAccessLive(a) ? "Active" : "Expired",
    reference: a.reference || "—",
    createdAt: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—",
    expiresAt: new Date(a.expiresAt).toLocaleDateString(),
  }));

  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-800">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Belt of Truth Mentorship</p>
        </div>
        <LogoutButton />
      </div>

      {!sanityWriteClient && (
        <div className="mb-8 rounded-xl border border-gold-500/40 bg-gold-500/10 p-4 text-sm text-navy-800">
          ⚠️ No data yet — this dashboard needs <code>SANITY_API_TOKEN</code> set in your
          environment variables before it can show submissions, donations, or ebook access.
        </div>
      )}

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-[0_3px_12px_rgba(0,0,0,0.07)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Total Raised
          </p>
          <p className="font-display mt-1 text-2xl font-bold text-navy-800">
            KSh {totalRaisedKes.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-[0_3px_12px_rgba(0,0,0,0.07)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Join / Volunteer Inquiries
          </p>
          <p className="font-display mt-1 text-2xl font-bold text-navy-800">
            {submissions.length}
          </p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-[0_3px_12px_rgba(0,0,0,0.07)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Active Ebook Readers
          </p>
          <p className="font-display mt-1 text-2xl font-bold text-navy-800">
            {activeAccessCount}
          </p>
        </div>
      </div>

      <div className="space-y-12">
        {sanityWriteClient && (
          <>
            <div>
              <h2 className="mb-3 text-lg font-semibold text-navy-800">Add a New Book</h2>
              <div className="rounded-xl bg-white p-5 shadow-[0_3px_12px_rgba(0,0,0,0.07)]">
                <AddBookForm />
              </div>
              {books.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {books.map((book) => (
                    <Link
                      key={book._id}
                      href={`/read/${book.slug}`}
                      target="_blank"
                      className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-navy-800"
                    >
                      Preview &ldquo;{book.title}&rdquo; →
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-navy-800">Site Photos</h2>
              <div className="rounded-xl bg-white p-5 shadow-[0_3px_12px_rgba(0,0,0,0.07)]">
                <SiteMediaForm />
              </div>
            </div>

            {realPrograms.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-semibold text-navy-800">Program Photos</h2>
                <div className="space-y-4 rounded-xl bg-white p-5 shadow-[0_3px_12px_rgba(0,0,0,0.07)]">
                  {realPrograms.map((program) => (
                    <ProgramPhotoUploader
                      key={program._id}
                      programId={program._id}
                      title={program.title}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div>
          <h2 className="mb-3 text-lg font-semibold text-navy-800">Join / Volunteer Inquiries</h2>
          <DataTable
            rows={submissionRows}
            exportFilename="inquiries.csv"
            emptyMessage="No inquiries yet."
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              { key: "interest", label: "Interested In" },
              { key: "message", label: "Message" },
              { key: "submittedAt", label: "Submitted" },
            ]}
          />
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-navy-800">Donations & Purchases</h2>
          <DataTable
            rows={donationRows}
            exportFilename="donations.csv"
            emptyMessage="No donations or purchases yet."
            columns={[
              { key: "donorName", label: "Name" },
              { key: "donorEmail", label: "Email" },
              { key: "amountKes", label: "Amount" },
              { key: "kind", label: "Type" },
              { key: "bookTitle", label: "Book" },
              { key: "reference", label: "Reference" },
              { key: "paidAt", label: "Paid" },
            ]}
          />
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-navy-800">Ebook Reader Access</h2>
          <DataTable
            rows={ebookAccessRows}
            exportFilename="ebook-access.csv"
            emptyMessage="No ebook access grants yet."
            columns={[
              { key: "buyerEmail", label: "Buyer" },
              { key: "book", label: "Book" },
              { key: "status", label: "Status" },
              { key: "reference", label: "Reference" },
              { key: "createdAt", label: "Granted" },
              { key: "expiresAt", label: "Expires" },
            ]}
          />
          <p className="mt-2 text-xs text-gray-400">
            To revoke a buyer&apos;s access, open Sanity Studio → People &amp; Payments → Ebook
            Reader Access → set &ldquo;Revoked&rdquo; to true.
          </p>
        </div>
      </div>
    </section>
  );
}
