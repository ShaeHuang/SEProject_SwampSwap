const iconModules = import.meta.glob<string>("../../public/assets/image/icon_*.png", {
  eager: true,
  import: "default",
});

export const profileIconOptions = Object.entries(iconModules)
  .map(([path, src]) => {
    const fileName = path.split("/").pop() ?? "icon_unknown.png";
    const id = fileName.replace(".png", "");
    const name = id
      .replace(/^icon_/, "")
      .split(/[_-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    return { id, name: name || id, src };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export const defaultProfileIcon =
  profileIconOptions.find((option) => option.id === "icon_curious")?.src ??
  "/assets/image/icon_curious.png";
