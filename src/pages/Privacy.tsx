import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import sonaraLogo from "@/assets/sonara-logo.jpg";

const LAST_UPDATED = "May 9, 2026";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Helmet>
        <title>Privacy Policy | Sonara</title>
        <meta name="description" content="How Sonara collects, uses and protects your account and listening data across our music streaming app." />
        <link rel="canonical" href="https://sonora-rhythm.lovable.app/privacy" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Privacy Policy | Sonara" />
        <meta property="og:description" content="How Sonara collects, uses and protects your data." />
        <meta property="og:url" content="https://sonora-rhythm.lovable.app/privacy" />
      </Helmet>
      <header className="border-b border-white/5 px-4 sm:px-12 py-4 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={sonaraLogo} alt="Sonara music streaming logo" className="w-8 h-8 rounded-lg" />
          <span className="font-black">Sonara</span>
        </Link>
      </header>
      <article className="prose prose-invert max-w-3xl mx-auto px-4 sm:px-8 py-10 prose-headings:text-white prose-a:text-[#1ed760]">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-[#b3b3b3]">Last updated: {LAST_UPDATED}</p>

        <p>
          Sonara (&quot;Sonara&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a music
          streaming application that aggregates publicly available content from third-party services
          including JioSaavn, YouTube and Audius. This Privacy Policy explains what information we
          collect, how we use it, and your rights in relation to that information.
        </p>

        <h2>1. Information we collect</h2>
        <h3>a. Account information</h3>
        <p>
          When you sign up, we collect your email address and (if you sign in with Google) your
          name, profile picture and Google account ID. We never see your Google password.
        </p>
        <h3>b. Listening data</h3>
        <p>
          We store your liked songs, playlists, recently played tracks, uploads and personalised
          preferences locally on your device. Some of this data may be synced to your Sonara account
          if you are signed in.
        </p>
        <h3>c. Device and usage data</h3>
        <p>
          We collect basic technical data (browser type, device type, approximate region from your
          IP address, crash logs) to keep the service running and diagnose problems.
        </p>
        <h3>d. Uploaded content</h3>
        <p>
          When you upload audio files, those files stay on your device unless you explicitly choose
          to share them. You are responsible for the files you upload — see Section 6.
        </p>

        <h2>2. How we use your information</h2>
        <ul>
          <li>To provide, personalise and improve Sonara</li>
          <li>To authenticate you and keep your account secure</li>
          <li>To remember your preferences (theme, queue, favourites)</li>
          <li>To prevent fraud and abuse</li>
          <li>To comply with legal obligations</li>
        </ul>

        <h2>3. Third-party services</h2>
        <p>
          Sonara streams audio and metadata from <strong>JioSaavn</strong>, <strong>YouTube</strong>{" "}
          (via the YouTube Data API and YouTube IFrame Player) and <strong>Audius</strong>. When you
          play a track, your device communicates directly with these services and is subject to
          their privacy policies:
        </p>
        <ul>
          <li>
            YouTube: <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">policies.google.com/privacy</a>
          </li>
          <li>
            Audius: <a href="https://audius.co/legal/privacy-policy" target="_blank" rel="noreferrer">audius.co/legal/privacy-policy</a>
          </li>
          <li>JioSaavn: <a href="https://www.jiosaavn.com/corporate/privacypolicy/" target="_blank" rel="noreferrer">jiosaavn.com/corporate/privacypolicy</a></li>
        </ul>

        <h2>4. Cookies & local storage</h2>
        <p>
          We use browser <code>localStorage</code> to remember your settings, queue, recently played
          tracks and authentication session. We do <strong>not</strong> use third-party advertising
          cookies.
        </p>

        <h2>5. Children</h2>
        <p>
          Sonara is not directed at children under 13. If you believe a child under 13 has provided
          us with personal information, contact us and we will delete it.
        </p>

        <h2>6. DMCA / copyright</h2>
        <p>
          We respect intellectual property rights. If you believe content available through Sonara
          infringes your copyright, send a notice to <strong>dmca@sonara.app</strong> with the URL,
          a description of the work, your contact info and a good-faith statement. We will respond
          to valid notices promptly.
        </p>

        <h2>7. Data retention</h2>
        <p>
          We keep your account data while your account is active. You can delete your account at any
          time from <Link to="/profile">Profile → Account</Link>; this removes your account
          information within 30 days.
        </p>

        <h2>8. Your rights</h2>
        <p>
          Depending on where you live, you may have the right to access, correct, export or delete
          your personal data, or to object to its processing. Email{" "}
          <strong>privacy@sonara.app</strong> to make a request.
        </p>

        <h2>9. Security</h2>
        <p>
          We use industry-standard encryption (HTTPS/TLS) and secure cloud infrastructure. No system
          is perfect, so we cannot guarantee absolute security.
        </p>

        <h2>10. International users</h2>
        <p>
          Sonara is operated globally. By using Sonara you consent to your information being
          processed in the country where our infrastructure is hosted.
        </p>

        <h2>11. Changes to this policy</h2>
        <p>
          We may update this policy from time to time. Material changes will be announced inside the
          app at least 30 days before they take effect.
        </p>

        <h2>12. Contact</h2>
        <p>
          Questions? Email <strong>privacy@sonara.app</strong>.
        </p>

        <p className="mt-12">
          <Link to="/terms">Read our Terms &amp; Conditions →</Link>
        </p>
      </article>
    </div>
  );
}
