function Layout({ title, subtitle, leftContent, rightContent }) {
  return (
    <div className="min-h-screen bg-[#0e1117] text-[#fafafa]">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-2xl font-bold mb-1">{title}</h1>
        {subtitle && (
          <p className="text-[20px] text-[#a0a0a0]">{subtitle}</p>
        )}
      </header>

      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row">
        {/* Left column - 75% on desktop */}
        <main className="flex-1 md:w-3/4 p-6">
          {leftContent}
        </main>

        {/* Right column - 25% on desktop */}
        <aside className="md:w-1/4 p-6 border-t md:border-t-0 md:border-l border-gray-800">
          {rightContent}
        </aside>
      </div>
    </div>
  )
}

export default Layout
