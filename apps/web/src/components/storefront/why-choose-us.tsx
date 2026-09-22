const REASONS = [
  {
    title: "Premium Quality Hair",
    body: "We source high quality human hair wigs that are soft, durable, and designed to maintain their beauty with proper care.",
    icon: (
      <>
        <path d="M12 3 4 6v5c0 4.5 3.2 8.2 8 10 4.8-1.8 8-5.5 8-10V6l-8-3Z" />
        <path d="m8.5 12 2.5 2.5 4.5-5" />
      </>
    ),
  },
  {
    title: "Fast & Reliable Delivery",
    body: "Enjoy a seamless shopping experience with secure ordering, prompt processing, and reliable nationwide delivery.",
    icon: (
      <>
        <path d="M2 6h11v10H2zM13 9h4l3 3v4h-7" />
        <circle cx="7" cy="17.5" r="1.8" />
        <circle cx="17" cy="17.5" r="1.8" />
      </>
    ),
  },
  {
    title: "Wide Range of Styles",
    body: "From sleek bone straight wigs to voluminous curls and trendy bob cuts, we offer styles for every personality and occasion.",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m10 9.5 5 2.5-5 2.5v-5Z" />
      </>
    ),
  },
];

export function WhyChooseUs() {
  return (
    <section className="store-container py-12 md:py-16">
      <h2 className="text-center font-heading text-2xl font-bold md:text-3xl">
        Why choose us
      </h2>
      <div className="mt-8 grid gap-8 rounded-md bg-white px-6 py-8 shadow-[0_2px_24px_rgba(0,0,0,0.06)] md:grid-cols-3 md:gap-6 md:px-10">
        {REASONS.map((reason) => (
          <div key={reason.title} className="flex flex-col items-center text-center">
            <svg
              viewBox="0 0 24 24"
              className="h-9 w-9 fill-none stroke-store-gold"
              strokeWidth={1.3}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {reason.icon}
            </svg>
            <h3 className="mt-4 font-heading text-base font-bold">
              {reason.title}
            </h3>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-store-muted">
              {reason.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
