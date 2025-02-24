export const scrollToElement = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};

export const handleHashChange = () => {
  const hash = window.location.hash;
  if (hash) {
    const elementId = hash.replace("#", "");
    setTimeout(() => {
      scrollToElement(elementId);
    }, 0);
  }
};
