import React, { useEffect, useState } from "react";
import { routes } from "../../routes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  Menu,
  Image,
  Container,
  Group,
  useMantineColorScheme,
  Button,
  Flex,
  Text,
  Avatar,
  Title,
  useMantineTheme,
  parseThemeColor,
} from "@mantine/core";
import {
  NAVBAR_HEIGHT,
  NAVBAR_HEIGHT_NUMBER,
} from "../../constants/theme-constants";
import { NavLink, NavLinkProps, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";
import { UserDto } from "../../constants/types";
import { useAuth } from "../../authentication/use-auth";
import { createStyles } from "@mantine/emotion";

type PrimaryNavigationProps = {
  user?: UserDto;
};

type NavigationItem = {
  text: string;
  icon?: IconProp | undefined;
  hide?: boolean;
} & (
  | {
      nav: Omit<
        NavLinkProps,
        keyof React.AnchorHTMLAttributes<HTMLAnchorElement>
      >;
      children?: never;
    }
  | { nav?: never; children: NavigationItemForceNav[] }
);

export type NavigationItemForceNav = {
  text: string;
  icon?: IconProp | undefined;
  hide?: boolean;
  nav: NavLinkProps;
};

const navigation: NavigationItem[] = [
  {
    text: "Home",
    hide: false,
    nav: {
      to: routes.home,
    },
  },

  {
    text: "Get Engaged",
    hide: false,
    nav: {
      to: routes.engage,
    },
  },

  
  {
    text: "Review Events",
    hide: false,
    nav: {
      to: routes.review,
    },
  },

  {
    text: "Dashboard",
    hide: false,
    nav: {
      to: routes.dashboard,
    },
  },

  {
    text: "Sign Up",
    hide: false,
    nav: {
      to: routes.usersignup,
    },
  },
];

const DesktopNavigation = () => {
  const { classes, cx } = useStyles();
  const { pathname } = useLocation();
  const [active, setActive] = useState(navigation[0].nav?.to.toString());

  useEffect(() => {
    setActive(pathname);
  }, [pathname, setActive]);

  return (

      <Container px={0} className={classes.desktopNav}>
        <Flex direction="row" align="center" className={classes.fullHeight}>
          {navigation
            .filter((x) => !x.hide)
            .map((x, i) => {
              if (x.children) {
                return (
                  <Menu trigger="hover" key={i}>
                    <Menu.Target>
                      <Button
                        size="md"
                        className={classes.paddedMenuItem}
                        variant="subtle"
                        key={i}
                      >
                        {x.icon && <FontAwesomeIcon icon={x.icon} />} {x.text}
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {x.children
                        .filter((x) => !x.hide)
                        .map((y) => {
                          return (
                            <Menu.Item
                              key={`${y.text}`}
                              to={y.nav.to}
                              component={NavLink}
                            >
                              <Flex direction="row">
                                <Text size="sm">
                                  {y.icon && <FontAwesomeIcon icon={y.icon} />}{" "}
                                  {y.text}
                                </Text>
                              </Flex>
                            </Menu.Item>
                          );
                        })}
                    </Menu.Dropdown>
                  </Menu>
                );
              }
              return (
                <Button
                  size="sm"
                  component={NavLink}
                  to={x.nav.to}
                  className={cx(classes.paddedMenuItem, {
                    [classes.linkActive]: active === x.nav.to,
                  })}
                  variant="subtle"
                  key={i}
                >
                  {x.icon && <FontAwesomeIcon icon={x.icon} />} {x.text}
                </Button>
              );
            })}
        </Flex>
      </Container>
  );
};

export const PrimaryNavigation: React.FC<PrimaryNavigationProps> = ({
  user,
}) => {
  const { classes } = useStyles();
  const { logout } = useAuth();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "light";
  return (
    <Title order={4}>
      <Container px={20} fluid>
        <Flex direction="row" justify="space-between" align="center">
          <Group>
            <Flex direction="row" align="center">
              <NavLink to={routes.root}>
                <Image
                  className={classes.logo}
                  w={140}
                  h={50}
                  radius="sm"
                  fallbackSrc="https://placehold.co/600x400?text=Placeholder"
                  src={"/src/assets/remove.png"}
                  alt="logo"
                />
              </NavLink>
              {user && <DesktopNavigation />}
            </Flex>
          </Group>
          <Group>
            {user && (
              <Menu>
                <Menu.Target>
                  <Avatar className={classes.pointer}>
                    {user.firstName.substring(0, 1)}
                    {user.lastName.substring(0, 1)}
                  </Avatar>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item onClick={() => toggleColorScheme()}>
                    {dark ? "Dark mode" : "Light mode"}
                  </Menu.Item>
                  <Menu.Item onClick={() => logout()}>Sign Out</Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        </Flex>
      </Container>
    </Title>
  );
};

const useStyles = createStyles((theme) => {
  return {
    pointer: {
      cursor: "pointer",
    },
    logo: {
      cursor: "pointer",
      marginRight: "5px",
      paddingTop: "5px",
      size: "10px",
      height: NAVBAR_HEIGHT,
    },
    paddedMenuItem: {
      margin: "0px 5px 0px 5px",
    },
    linkActive: {
      position: "relative", 
      color: "orange", 

      "&::after": {
        content: "''", 
        position: "absolute",
        left: 0,
        bottom: 0, 
        width: "0%", 
        height: "2px", 
        backgroundColor: "#b20300", 
        transition: "width 0.3s ease-in-out", 
      },

      "&:hover::after": {
        width: "100%", 
      },

      "&::after:hover": {
        width: "0%", 
      },
    },
    desktopNav: {
      height: NAVBAR_HEIGHT,
    },
    fullHeight: {
      height: "100%",
    },
  };
});
