import { logoutAction } from "../_services/actions";
import { getSession } from "@/lib/session";
import { Button } from "@chakra-ui/react";

const Dashboard = async () => {
  const session = await getSession();
  const name = session?.user?.name || session?.user?.email || "User";

  return (
    <div>
      <h1>Welcome to your account{` , ${name}`}</h1>
      <form action={logoutAction}>
        <Button type="submit">Log Out</Button>
      </form>
    </div>
  );
};

export default Dashboard;
