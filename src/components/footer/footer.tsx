import React from "react";
import {
  ActionIcon,
  Container,
  Group,
  Text,
  useMantineColorScheme,
  Image,
} from "@mantine/core";
import {
  IconBrandInstagram,
  IconBrandTwitter,
  IconBrandYoutube,
} from "@tabler/icons-react";
import { createStyles } from "@mantine/emotion";
import logo from "/src/assets/remove.png"; // Correct the path to your logo file

const data = [
  {
    title: "Explore",
    links: [
      { label: "Events", link: "/features" },
      { label: "Chatrooms", link: "/pricing" },
    ],
  },
  {
    title: "Contribute",
    links: [
      { label: "Organization", link: "/contribute" },
      { label: "Review", link: "/media-assets" },
    ],
  },
  {
    title: "Notified",
    links: [
      { label: "Sign Up", link: "" },
      { label: "Change Theme", link: "" },
    ],
  },
];

export function FooterLinks() {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const { classes } = useStyles({ dark });

  const groups = data.map((group) => {
    const links = group.links.map((link, index) => (
      <Text<'a'>
        key={index}
        className={classes.link}
        component="a"
        href={link.link}
        target={link.link.startsWith("http") ? "_blank" : "_self"}
        rel={link.link.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {link.label}
      </Text>
    ));

    return (
      <div className={classes.wrapper} key={group.title}>
        <Text className={classes.title}>{group.title}</Text>
        {links}
      </div>
    );
  });

  return (
    <footer className={classes.footer}>
      <Container className={classes.inner}>
        <Text size="md" className={classes.description}>
            Meet people, and make lifelong connections. Find events that are not
            only fun but memorable.
          </Text>
      </Container>
      <Container className={classes.afterFooter}>
        <Text size="sm">© 2024 CampusEvents. All rights reserved.</Text>
        <Group gap={0} className={classes.social} justify="flex-end" wrap="nowrap">
          <ActionIcon size="lg" variant="subtle" aria-label="Twitter">
            <IconBrandTwitter size={18} stroke={1.5} />
          </ActionIcon>
          <ActionIcon size="lg" variant="subtle" aria-label="YouTube">
            <IconBrandYoutube size={18} stroke={1.5} />
          </ActionIcon>
          <ActionIcon size="lg" variant="subtle" aria-label="Instagram">
            <IconBrandInstagram size={18} stroke={1.5} />
          </ActionIcon>
        </Group>
      </Container>
    </footer>
  );
}

const useStyles = createStyles((theme, { dark }: { dark: boolean }) => ({
  footer: {
    marginTop: 150,
    paddingTop: theme.spacing.xl,
    paddingBottom: "auto",
    backgroundColor: dark ? theme.colors.dark[6] : theme.colors.gray[0],
    borderTop: `1px solid ${dark ? theme.colors.dark[5] : theme.colors.gray[2]}`,
  },

  description: {
    marginTop: 1,
    color: dark ? theme.colors.dark[1] : theme.colors.gray[6],
    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      marginTop: theme.spacing.xs,
      textAlign: "center",
    },
  },

  inner: {
    display: "flex",
    justifyContent: "center",
    color: "white",
    alignItems: "center",
    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      flexDirection: "column",
      alignItems: "center",
    },
  },

  groups: {
    display: "flex",
    flexWrap: "wrap",
    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      display: "none",
    },
  },

  wrapper: {
    width: 130,
  },

  link: {
    display: "block",
    color: dark ? theme.colors.dark[1] : theme.colors.gray[6],
    fontSize: theme.fontSizes.sm,
    paddingTop: 3,
    paddingBottom: 3,
    "&:hover": {
      textDecoration: "underline",
    },
  },

  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 700,
    fontFamily: theme.headings.fontFamily,
    marginBottom: theme.spacing.xs,
    color: dark ? theme.white : theme.black,
  },

  afterFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    borderTop: `1px solid ${dark ? theme.colors.dark[4] : theme.colors.gray[2]}`,
    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      flexDirection: "column",
    },
  },

  social: {
    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      marginTop: theme.spacing.xs,
    },
  },
}));

export default FooterLinks;
