import { createUploadthing } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  projectAttachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 4 },
    pdf: { maxFileSize: "8MB", maxFileCount: 2 },
  })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Uploaded by:", metadata.userId);
      return { url: file.ufsUrl }; // v7 uses ufsUrl instead of url
    }),
};