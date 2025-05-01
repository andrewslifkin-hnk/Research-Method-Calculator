import FeaturePrioritizationTool from "@/feature-prioritization-tool"

export default function Home() {
  return (
    <main>
      <div className="min-h-screen bg-gray-50 py-8" id="feature-tool">
        <div className="container mx-auto px-4">
          <FeaturePrioritizationTool />
        </div>
      </div>
    </main>
  )
}
