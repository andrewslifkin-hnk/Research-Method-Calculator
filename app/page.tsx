import FeaturePrioritizationTool from "@/feature-prioritization-tool"

export default function Home() {
  return (
    <main>
      <div className="bg-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Make smarter decisions <br />
              <span className="relative inline-block">
                with data-backed research
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-white"></span>
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl">
              Optimize your product development strategy with our Experimentation Matrix Tool. Identify the most
              effective research methods for your specific features.
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50 py-8" id="feature-tool">
        <div className="container mx-auto px-4">
          <FeaturePrioritizationTool />
        </div>
      </div>
    </main>
  )
}
