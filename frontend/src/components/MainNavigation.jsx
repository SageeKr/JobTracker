import * as React from "react";
import MenuIcon from "@mui/icons-material/Menu";
import logo from "../assets/logo.png";
import {
  AppBar,
  Box,
  Typography,
  IconButton,
  Toolbar,
  MenuItem,
  Tooltip,
  Avatar,
  Container,
  Menu,
} from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";

function MainNavigation({ user }) {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const navigate = useNavigate();

  const pages = [
    { name: "Dashboard", link: "/dashboard" },
    { name: "My Positions", link: "/positions" },
    { name: "About", link: "about" },

  ];

  const profileSettings = [
    { name: "Profile", link: "userprofile" },
    {
      name: "Logout",
      onClick: async () => {
        const res = await fetch("http://localhost:8080/logout", {
          credentials: "include",
        });

        if (res.ok) navigate("/login");
      },
    },
  ];

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="static" sx={{ mb: 2 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <NavLink to="dashboard" style={{ display: 'flex', alignItems: 'center' }}>
            <Box
              component="img"
              src={logo}
              alt="Job Tracker Logo"
              sx={{
                height: 40,
                width: "auto", 
                display: { xs: "none", md: "flex" },
                mr: 2,
              }}
            />
          </NavLink>
          <Typography
            variant="h6"
            noWrap
            component={NavLink}
            to="dashboard"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".2rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Job Tracker
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {pages.map((page) => (
                <MenuItem
                  component={page?.link ? NavLink : undefined}
                  to={page.link}
                  key={page.name}
                  onClick={handleCloseNavMenu}
                >
                  <Typography textAlign="center">{page.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <NavLink to="dashboard" style={{ display: 'flex', alignItems: 'center' }}>
            <Box
              component="img"
              src={logo}
              alt="Job Tracker Logo"
              sx={{
                height: 30,
                width: "auto", 
                display: { xs: "flex", md: "none" },
                mr: 2,
              }}
            />
          </NavLink>
          <Typography
            variant="h6"
            noWrap
            component={NavLink}
            to="dashboard"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".1rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Job Tracker
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <MenuItem
                component={page?.link ? NavLink : undefined}
                to={page.link}
                key={page.name}
                onClick={handleCloseNavMenu}
              >
                <Typography textAlign="center" color="primary.contrastText">
                  {page.name}
                </Typography>
              </MenuItem>
            ))}
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            {user && (
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar>
                    {" "}
                    <Typography variant="h6">
                      {user.name.charAt(0).toUpperCase()}
                    </Typography>
                  </Avatar>
                  {/* {user.name}  */}
                </IconButton>
              </Tooltip>
            )}
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {profileSettings.map((setting) => (
                <MenuItem
                  component={setting?.link ? NavLink : undefined}
                  to={setting.link}
                  key={setting.name}
                  onClick={() => {
                    handleCloseUserMenu();
                    if (setting.onClick) {
                      setting.onClick();
                    }
                  }}
                >
                  <Typography textAlign="center">{setting.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default MainNavigation;
