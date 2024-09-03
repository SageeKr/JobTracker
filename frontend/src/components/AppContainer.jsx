import { Outlet , useLoaderData } from "react-router-dom";
import MainNavigation from './MainNavigation.jsx';
import Footer from './Footer.jsx';
import { Box } from '@mui/material';

function RootLayout() {
    const me = useLoaderData();

    return (
        <Box
            display="flex"
            flexDirection="column"
            minHeight="100vh"
        >
            <MainNavigation user={me} />
            <Box
                component="main"
                flex="1"
            >
                <Outlet context={{ user: me }} />
            </Box>
            <Footer />
        </Box>
    );
}

export default RootLayout;

// const user = useLoaderData();
// const defaultUser = {
//     name: "temp",
//     email: "temp@example.com"
// };
// {/* context={user || { user: defaultUser }} / */}useLoaderData