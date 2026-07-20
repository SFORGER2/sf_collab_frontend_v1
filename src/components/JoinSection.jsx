export default function JoinSection({ title, text, ref }) {
  return <>
    <section ref={ref} className="py-24 px-6 lg:px-20 bg-gradient-to-r from-indigo-600 to-purple-700 text-center">
      <h2 className="text-3xl lg:text-4xl font-semibold mb-6">{title}</h2>
      <p className="text-gray-200 mb-10">
          {text}
      </p>
      <a
        href="/waitlist"
        className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition"
      >
        Join Waitlist →
      </a>
    </section>
  </>
}