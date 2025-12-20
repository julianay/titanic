/**
 * Layout - Fixed split-screen layout for the application
 *
 * Structure:
 * - Left column (80%): Header + visualizations, scrolls naturally
 * - Right column (20%): Fixed in viewport, contains controls + chat
 *
 * @param {string} title - Main page title (displays in header)
 * @param {string} subtitle - Subtitle text (optional)
 * @param {React.ReactNode} leftContent - Content for left column (visualizations)
 * @param {React.ReactNode} controlsContent - Content for right column top (controls accordion)
 * @param {React.ReactNode} chatContent - Content for right column bottom (chat panel)
 *
 * @example
 * <Layout
 *   title="My App"
 *   subtitle="Description"
 *   leftContent={<Visualizations />}
 *   controlsContent={<ControlPanel />}
 *   chatContent={<ChatPanel />}
 * />
 *
 * COMMON CHANGES:
 * - Column widths: Change w-[80%] and w-[20%] (must add to 100%)
 * - Spacing: Modify p-6, px-6, pt-4, pb-3 classes
 * - Colors: Change bg-[#0e1117], border-gray-800
 *
 * AVOID CHANGING:
 * - Fixed positioning logic (position: fixed, height: 100vh)
 * - Flex layout structure (flex, flex-col, flex-1)
 */
function Layout({ title, subtitle, leftContent, controlsContent, chatContent }) {
  return (
    <div className="min-h-screen bg-[#0e1117] text-[#fafafa]">
      <div className="flex">
        {/* Left column - 80% width, includes header and scrolls naturally */}
        <div className="w-[80%]">
          {/* Header - scrolls with left content */}
          <header className="border-b border-gray-800 px-6 py-4">
            <h1 className="text-2xl font-bold mb-1">{title}</h1>
            {subtitle && (
              <p className="text-[20px] text-[#a0a0a0]">{subtitle}</p>
            )}
          </header>

          {/* Main content */}
          <main className="p-6">
            {leftContent}
          </main>
        </div>

        {/* Right column - 20% width, fixed in viewport, full height */}
        <aside
          className="w-[20%] border-l border-gray-800 fixed right-0 flex flex-col bg-[#0e1117]"
          style={{
            height: '100vh',
            top: 0
          }}
        >
          {/* Controls section at top */}
          {controlsContent && (
            <div className="px-6 pt-4 pb-3 border-b border-gray-800">
              {controlsContent}
            </div>
          )}

          {/* Chat section - takes remaining space */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {chatContent}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Layout
