import type { StructureResolver } from "sanity/structure";
import {
  HiOutlineHome,
  HiOutlineBookOpen,
  HiOutlineUserGroup,
} from "react-icons/hi";

// Plain-language, grouped navigation for non-technical editors. "Ebook Page"
// (the auto-generated page-render cache — see lib/ebook-render.ts) and
// "M-Pesa Transaction" (internal STK push bookkeeping — see lib/mpesa.ts)
// are deliberately left out of every group below: neither is ever meant to
// be opened by a human, so it's simplest to just not show them rather than
// explain why they exist every time someone looks at the sidebar.
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Belt of Truth Admin")
    .items([
      S.listItem()
        .title("Website Content")
        .icon(HiOutlineHome)
        .child(
          S.list()
            .title("Website Content")
            .items([
              S.listItem()
                .title("Site Settings")
                .child(
                  S.document().schemaType("siteSettings").documentId("siteSettings")
                ),
              S.divider(),
              S.documentTypeListItem("focusArea").title("Focus Areas"),
              S.documentTypeListItem("program").title("Programs"),
              S.documentTypeListItem("freeResource").title("Free Resources"),
              S.documentTypeListItem("coreValue").title("Core Values"),
              S.documentTypeListItem("testimony").title("Stories"),
            ])
        ),
      S.listItem()
        .title("Books & Ebooks")
        .icon(HiOutlineBookOpen)
        .child(S.documentTypeList("book").title("Books")),
      S.listItem()
        .title("People & Payments")
        .icon(HiOutlineUserGroup)
        .child(
          S.list()
            .title("People & Payments")
            .items([
              S.documentTypeListItem("contactSubmission").title(
                "Join / Volunteer Inquiries"
              ),
              S.documentTypeListItem("donation").title("Donations & Purchases"),
              S.documentTypeListItem("ebookAccess").title(
                "Ebook Reader Access (revoke here if needed)"
              ),
            ])
        ),
    ]);
