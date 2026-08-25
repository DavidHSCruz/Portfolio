const PRIVATE_PROJECT_IMAGES: Record<string, string> = {
  igrejafire: "Igreja_FIRE_WEB.png",
  casadinhosblog: "CasadinhosBLOG.png",
};

export function getProjectImage(
  name: string,
  isPrivate: boolean,
  username: string,
) {
  if (isPrivate) {
    const filename = PRIVATE_PROJECT_IMAGES[name.toLowerCase()] ?? name + ".png";
    return "/imagens/Projetos/" + filename;
  }

  return `https://raw.githubusercontent.com/${username}/${name}/refs/heads/main/public/assets/images/capa.png`;
}
