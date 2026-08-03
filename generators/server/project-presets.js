export const PROJECT_PRESETS = {
    custom: {},
    minimal: {
        databaseType: 'postgresql',
        dbMigrationTool: 'flywaydb',
        features: [],
        messagingType: 'none',
        cacheType: 'none',
        authenticationType: 'none',
        javaVersion: '17',
        buildTool: 'maven',
        loggingType: 'none',
        persistence: 'jpa',
        dbMigrationFormat: 'xml'
    },
    'secure-api': {
        databaseType: 'postgresql',
        dbMigrationTool: 'flywaydb',
        features: [],
        messagingType: 'none',
        cacheType: 'none',
        authenticationType: 'jwt',
        javaVersion: '25',
        springBootVersion: '4.1.0',
        buildTool: 'maven',
        loggingType: 'none',
        persistence: 'jpa',
        dbMigrationFormat: 'xml'
    },
    'event-driven': {
        databaseType: 'postgresql',
        dbMigrationTool: 'flywaydb',
        features: [],
        messagingType: 'kafka',
        cacheType: 'redis',
        authenticationType: 'none',
        javaVersion: '25',
        springBootVersion: '4.1.0',
        buildTool: 'maven',
        loggingType: 'none',
        persistence: 'jpa',
        dbMigrationFormat: 'xml'
    },
    'observability-heavy': {
        databaseType: 'postgresql',
        dbMigrationTool: 'flywaydb',
        features: ['elk', 'monitoring', 'otel'],
        messagingType: 'none',
        cacheType: 'none',
        authenticationType: 'none',
        javaVersion: '25',
        springBootVersion: '4.1.0',
        buildTool: 'maven',
        loggingType: 'loki',
        persistence: 'jpa',
        dbMigrationFormat: 'xml'
    }
};

export const PROJECT_PRESET_CHOICES = [
    {
        value: 'custom',
        name: 'Custom (answer every question)'
    },
    {
        value: 'minimal',
        name: 'Minimal API'
    },
    {
        value: 'secure-api',
        name: 'Secure API'
    },
    {
        value: 'event-driven',
        name: 'Event-driven service'
    },
    {
        value: 'observability-heavy',
        name: 'Observability-heavy service'
    }
];

export function getProjectPresetDefaults(projectPreset) {
    return PROJECT_PRESETS[projectPreset] || PROJECT_PRESETS.custom;
}
