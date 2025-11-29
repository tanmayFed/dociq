import UploadFile from "@/components/ui/uploadFile";
import { getSession } from "@/lib/session";
import { getUserDocuments } from "../_services/getUserDocuments";
import { deleteUserDocument } from "../_services/deleteDocument";
import { Stack } from "@chakra-ui/react";

const Dashboard = async () => {
  const session = await getSession();
  const userId = session?.user?.userId || "";
  const name = session?.user?.name || session?.user?.email || "User";
  const documents = await getUserDocuments(userId);

  return (
    <Stack gap="12" p="8">
      <h1>Welcome {` , ${name}`}</h1>

      <UploadFile
        userId={userId}
        documents={documents}
        onDeleteDocument={deleteUserDocument}
      />
    </Stack>
  );
};

export default Dashboard;
