import constants from '../constants.js';

export const SPRING_BOOT_VERSION_CHOICES = [
    {
        value: constants.SPRING_BOOT_VERSION,
        name: `Spring Boot ${constants.SPRING_BOOT_VERSION} (default)`
    },
    {
        value: '4.1.0',
        name: 'Spring Boot 4.1.0'
    }
];

export function resolveSpringCloudVersion(springBootVersion) {
    if (springBootVersion.startsWith('4.')) {
        return '2025.1.2';
    }

    return constants.SPRING_CLOUD_VERSION;
}

export function resolveTestcontainersVersion(springBootVersion) {
    if (springBootVersion.startsWith('4.')) {
        return '2.0.5';
    }

    return null;
}

export function resolveJavaImage(javaVersion) {
    if (javaVersion === '17') {
        return constants.JAVA_IMAGE;
    }

    if (javaVersion === '21' || javaVersion === '25') {
        return `eclipse-temurin:${javaVersion}-jre-jammy`;
    }

    return constants.JAVA_IMAGE;
}
