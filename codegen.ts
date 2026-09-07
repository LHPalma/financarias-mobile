import { config as loadEnv } from "dotenv";

import type { CodegenConfig } from "@graphql-codegen/cli";

loadEnv({ path: ".env.local" });

const config: CodegenConfig = {
	schema: process.env.EXPO_PUBLIC_GRAPHQL_URL,
	documents: ["src/**/*.graphql"],
	generates: {
		"src/generated/": {
			preset: "client",
			presetConfig: {
				// Off: só uma fragment/consumidor aqui; ligado, quebraria acesso direto tipo `item.fuelStation.name`.
				fragmentMasking: false,
			},
			config: {
				scalars: {
					Long: "number",
					Decimal: "number",
					LocalDate: "string",
					DateTime: "string",
				},
				enumsAsTypes: true,
			},
		},
	},
};

export default config;
