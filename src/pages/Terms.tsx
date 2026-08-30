import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import sonaraLogo from "@/assets/sonara-logo.jpg";

const LAST_UPDATED = "May 11, 2026";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Helmet>
        <title>Terms & Conditions | Sonara</title>
        <meta name="description" content="Terms of use for Sonara — account rules, uploads, community guidelines and creator obligations." />
        <link rel="canonical" href="https://sonora-rhythm.lovable.app/terms" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Terms & Conditions | Sonara" />
        <meta property="og:description" content="Terms of use for the Sonara music streaming service." />
        <meta property="og:url" content="https://sonora-rhythm.lovable.app/terms" />
      </Helmet>
      <header className="border-b border-white/5 px-4 sm:px-12 py-4 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={sonaraLogo} alt="Sonara music streaming logo" className="w-8 h-8 rounded-lg" />
          <span className="font-black">Sonara</span>
        </Link>
      </header>
      <article className="prose prose-invert max-w-3xl mx-auto px-4 sm:px-8 py-10 prose-headings:text-white prose-a:text-[#1ed760]">
        <h1>Terms &amp; Conditions</h1>
        <p className="text-sm text-[#b3b3b3]">Last updated: {LAST_UPDATED}</p>

        <p>
          These Terms govern your use of Sonara (the &quot;Service&quot;). By creating an account or
          using Sonara, you agree to be bound by them. If you do not agree, do not use the Service.
        </p>

        <h2>1. Eligibility</h2>
        <p>
          You must be at least 13 years old (or the minimum age in your country) to use Sonara. If
          you are under 18, you must have permission from a parent or legal guardian.
        </p>

        <h2>2. Your account</h2>
        <p>
          You are responsible for keeping your password secure and for all activity on your account.
          Notify us immediately at <strong>support@sonara.app</strong> if you suspect unauthorised
          use.
        </p>

        <h2>3. Guest mode &amp; account features</h2>
        <p>
          Anyone can listen to music on Sonara without an account. The following features require a
          free account: liking songs, creating playlists, queue management, audio download (where
          available), uploads, personalised recommendations, history sync, and player controls
          beyond basic play/pause.
        </p>

        <h2>4. Content sources</h2>
        <p>
          Sonara streams audio and metadata from third-party services including JioSaavn, YouTube
          and Audius. Sonara does not host this content; we provide an interface to publicly
          available APIs. Your use of that content is also subject to the terms of those services.
        </p>

        <h2>5. Acceptable use</h2>
        <p>You agree NOT to:</p>
        <ul>
          <li>Use Sonara for any illegal purpose or in violation of any laws</li>
          <li>Reverse engineer, decompile or attempt to extract source code</li>
          <li>Bypass quotas, rate limits, or content protections</li>
          <li>Upload content you do not have the right to distribute</li>
          <li>Use Sonara to harass, defame or harm others</li>
          <li>Scrape or republish content at scale without permission</li>
          <li>Interfere with the security or integrity of the Service</li>
        </ul>

        <h2>6. User uploads &amp; the Sonara AI Community</h2>
        <p>
          When you sign in, you can choose to be a <strong>Listener only</strong> or a{" "}
          <strong>Listener + AI Song Creator</strong>. You can switch modes anytime in your Profile.
          Creators unlock a public artist profile in the Sonara Community and may upload songs.
        </p>
        <p>
          By uploading audio you confirm that (a) you own the rights to it or generated it yourself
          using AI tools whose terms permit redistribution, and (b) the content does not infringe any
          third-party rights. You grant Sonara a non-exclusive, royalty-free licence to host, stream
          and display your uploads, artwork and bio for the purpose of providing the Service. You
          can remove your uploads at any time.
        </p>

        <h2>6a. Sonara AI verification (mandatory)</h2>
        <p>
          Every upload, artist name, bio and avatar is automatically reviewed by <strong>Sonara AI</strong>{" "}
          before going live. Submissions are auto-approved unless they contain:
        </p>
        <ul>
          <li>Hate speech targeting protected groups (race, religion, gender, sexuality, etc.)</li>
          <li>Sexual content involving minors (CSAM) — zero tolerance, also reported to authorities</li>
          <li>Direct incitement of real-world violence or terrorism</li>
          <li>Doxxing, harassment, or sharing of private information</li>
          <li>Content that is clearly illegal in the user&apos;s or Sonara&apos;s jurisdiction</li>
          <li>Impersonation of another real person or trademarked artist without permission</li>
          <li>Audio that is a direct copy of copyrighted recordings you do not control</li>
        </ul>
        <p>
          Profanity, romance, breakup themes, party themes, sad / dark moods and ordinary adult
          themes are permitted. If a submission is rejected, the AI shows you the reason and you may
          edit and re-submit. Approved items receive a <em>&quot;Verified by Sonara AI&quot;</em> badge.
          Sonara reserves the right to remove any content at any time, regardless of prior AI
          approval, if it is later found to violate these Terms.
        </p>

        <h2>6b. Creator rules of conduct</h2>
        <ul>
          <li>You are solely responsible for the content you publish.</li>
          <li>Do not use Sonara to launder copyrighted material.</li>
          <li>Do not buy, sell or trade plays, likes, followers or verification.</li>
          <li>Do not run external ads, donation links or affiliate spam inside your songs or bio.</li>
          <li>Keep your display name and avatar appropriate for a general audience.</li>
          <li>One person = one creator profile. No bot networks.</li>
        </ul>

        <h2>7. Intellectual property</h2>
        <p>
          The Sonara name, logo, design and code are owned by Sonara and protected by copyright and
          trademark law. You may not copy, modify or redistribute them without written permission.
        </p>

        <h2>8. Subscriptions, ads &amp; payments</h2>
        <p>
          Sonara is currently offered free of charge. We may introduce paid tiers in the future; you
          will not be charged without your explicit consent. The ad / new-releases section in the
          home feed plays muted previews and can be dismissed at any time from Profile → Settings.
        </p>

        <h2>9. Termination</h2>
        <p>
          We may suspend or terminate your account if you violate these Terms or use the Service in
          a way that harms us or others. You may delete your account at any time from{" "}
          <Link to="/profile">Profile</Link>.
        </p>

        <h2>10. Disclaimers</h2>
        <p>
          Sonara is provided &quot;AS IS&quot; without warranties of any kind, express or implied.
          We do not guarantee that the Service will always be available, error-free, secure or that
          any specific track will be playable.
        </p>

        <h2>11. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, Sonara and its team shall not be liable for any
          indirect, incidental, special, consequential or punitive damages arising out of your use
          of the Service. Our total liability is limited to the amount you paid us in the 12 months
          preceding the claim (which, for free users, is zero).
        </p>

        <h2>12. Indemnification</h2>
        <p>
          You agree to indemnify Sonara against any claim arising from your uploads, your violation
          of these Terms, or your violation of any third-party rights.
        </p>

        <h2>13. Changes</h2>
        <p>
          We may update these Terms. Material changes will be announced inside the app and the
          &quot;Last updated&quot; date will be revised. Continuing to use Sonara after changes
          means you accept them.
        </p>

        <h2>14. Governing law</h2>
        <p>
          These Terms are governed by the laws of India. Any dispute will be subject to the
          exclusive jurisdiction of the courts of New Delhi, India.
        </p>

        <h2>15. Contact</h2>
        <p>
          Questions about these Terms? Email <strong>support@sonara.app</strong>.
        </p>

        <p className="mt-12">
          <Link to="/privacy">Read our Privacy Policy →</Link>
        </p>
      </article>
    </div>
  );
}
