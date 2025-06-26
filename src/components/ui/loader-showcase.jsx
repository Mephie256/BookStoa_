import LoaderOne from './loader-one';

export function LoaderShowcase() {
    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-white mb-4">LoaderOne Component Showcase</h1>
                    <p className="text-gray-300">Different use cases for the animated loader component</p>
                </div>

                {/* Basic Usage */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                    <h2 className="text-xl font-semibold text-white mb-4">Basic Usage</h2>
                    <div className="flex items-center justify-center py-8 bg-gray-700/30 rounded-xl">
                        <LoaderOne />
                    </div>
                </div>

                {/* With Text */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                    <h2 className="text-xl font-semibold text-white mb-4">With Loading Text</h2>
                    <div className="flex flex-col items-center justify-center py-8 bg-gray-700/30 rounded-xl">
                        <div className="mb-4">
                            <LoaderOne />
                        </div>
                        <p className="text-gray-300">Loading books...</p>
                    </div>
                </div>

                {/* In Card */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                    <h2 className="text-xl font-semibold text-white mb-4">In Card Layout</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-700/30 rounded-xl p-6 text-center">
                            <h3 className="text-white font-medium mb-4">Loading Book Details</h3>
                            <LoaderOne />
                        </div>
                        <div className="bg-gray-700/30 rounded-xl p-6 text-center">
                            <h3 className="text-white font-medium mb-4">Processing Download</h3>
                            <LoaderOne />
                        </div>
                    </div>
                </div>

                {/* Button States */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                    <h2 className="text-xl font-semibold text-white mb-4">Button Loading States</h2>
                    <div className="flex flex-wrap gap-4">
                        <button className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-medium">
                            <div className="scale-75">
                                <LoaderOne />
                            </div>
                            Loading...
                        </button>
                        <button className="flex items-center gap-2 bg-gray-700 text-white px-6 py-3 rounded-xl font-medium">
                            <div className="scale-75">
                                <LoaderOne />
                            </div>
                            Processing
                        </button>
                    </div>
                </div>

                {/* Different Sizes */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                    <h2 className="text-xl font-semibold text-white mb-4">Different Sizes</h2>
                    <div className="flex items-center justify-around py-8 bg-gray-700/30 rounded-xl">
                        <div className="text-center">
                            <div className="scale-50 mb-2">
                                <LoaderOne />
                            </div>
                            <p className="text-xs text-gray-400">Small</p>
                        </div>
                        <div className="text-center">
                            <div className="mb-2">
                                <LoaderOne />
                            </div>
                            <p className="text-xs text-gray-400">Normal</p>
                        </div>
                        <div className="text-center">
                            <div className="scale-150 mb-2">
                                <LoaderOne />
                            </div>
                            <p className="text-xs text-gray-400">Large</p>
                        </div>
                    </div>
                </div>

                {/* Usage Code */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                    <h2 className="text-xl font-semibold text-white mb-4">Usage Examples</h2>
                    <div className="bg-gray-900/50 rounded-xl p-4 font-mono text-sm text-gray-300">
                        <div className="mb-4">
                            <p className="text-green-400 mb-2">// Basic usage</p>
                            <p>&lt;LoaderOne /&gt;</p>
                        </div>
                        <div className="mb-4">
                            <p className="text-green-400 mb-2">// With loading text</p>
                            <p>&lt;div className="text-center"&gt;</p>
                            <p>&nbsp;&nbsp;&lt;LoaderOne /&gt;</p>
                            <p>&nbsp;&nbsp;&lt;p&gt;Loading...&lt;/p&gt;</p>
                            <p>&lt;/div&gt;</p>
                        </div>
                        <div>
                            <p className="text-green-400 mb-2">// Scaled size</p>
                            <p>&lt;div className="scale-75"&gt;</p>
                            <p>&nbsp;&nbsp;&lt;LoaderOne /&gt;</p>
                            <p>&lt;/div&gt;</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
