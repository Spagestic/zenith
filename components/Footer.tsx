const Footer = () => {
  return (
    <footer>
      <div className="container px-4 md:px-10">
        <div className="border-t border-border py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-muted-foreground">
            © 2026 Zenith. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="https://github.com/Spagestic/zenith"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Github
            </a>
            <a
              href="https://hacktheeast.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              HackTheEast
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
