export default function PrivacyAndTerms() {
  return (
    <div className="container mx-auto max-w-4xl space-y-12 p-8">
      <div className="space-y-4">
        <h1 className="font-bold text-4xl tracking-tight">
          Privacy Policy & Terms of Service
        </h1>
        <p className="text-muted-foreground">
          Welcome to TubeLoopPlayer. This document outlines our Privacy Policy
          and Terms of Service. By using our service, you agree to these terms.
        </p>
      </div>

      <section className="space-y-6">
        <h2 className="border-b pb-2 font-bold text-3xl tracking-tight">
          Privacy Policy
        </h2>
        <div className="space-y-4">
          <p className="leading-relaxed text-muted-foreground">
            We are committed to protecting your privacy. This policy explains
            what information we collect and how we use it.
          </p>

          <div>
            <h3 className="mb-2 font-semibold text-2xl">
              Information We Collect
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              TubeLoopPlayer is a client-side application and does not collect
              any personally identifiable information (PII) such as your name or
              email address. We use cookies solely to enhance your user
              experience by storing the following data in your browser:
            </p>
            <ul className="my-4 ml-6 list-disc space-y-2 leading-relaxed text-muted-foreground">
              <li>
                <strong>Playlist:</strong> A list of YouTube video IDs and
                titles that you create.
              </li>
              <li>
                <strong>Playback Settings:</strong> Your preferences for loop
                and shuffle modes.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-2xl">
              How We Use Your Information
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              The information stored in cookies is used exclusively to provide
              the core functionality of the application, such as persisting your
              playlist and settings across sessions. We do not share this
              information with any third parties.
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-2xl">
              YouTube API Services
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              TubeLoopPlayer uses YouTube API Services to play videos. By using
              our service, you are agreeing to be bound by the{' '}
              <a
                href="https://www.youtube.com/t/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                YouTube Terms of Service
              </a>
              . We also encourage you to review the{' '}
              <a
                href="http://www.google.com/policies/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="border-b pb-2 font-bold text-3xl tracking-tight">
          Terms of Service
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 font-semibold text-2xl">Disclaimer</h3>
            <p className="leading-relaxed text-muted-foreground">
              The service is provided "as is" and "as available" without any
              warranties of any kind. We do not guarantee the accuracy,
              completeness, or reliability of the service. Your use of the
              service is at your own risk, and we are not liable for any damages
              arising from its use.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-2xl">Prohibited Conduct</h3>
            <p className="leading-relaxed text-muted-foreground">
              You agree not to use the service for any purpose that is unlawful
              or prohibited by these terms. You may not use the service in any
              manner that could damage, disable, or impair its operation. You
              are solely responsible for respecting copyright laws when using
              content from YouTube.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-2xl">
              Changes to the Terms
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              We reserve the right to modify these terms at any time. We will
              notify users of any changes by updating the "Last Updated" date.
              Your continued use of the service after such changes constitutes
              your acceptance of the new terms.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="border-b pb-2 font-bold text-3xl tracking-tight">
          Contact Us
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          If you have any questions about this Privacy Policy or our Terms of
          Service, please contact us.
        </p>
      </section>

      <footer className="text-center text-sm text-muted-foreground">
        <p>Last Updated: June 30, 2025</p>
      </footer>
    </div>
  );
}
