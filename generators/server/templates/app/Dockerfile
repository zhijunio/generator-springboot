FROM <%= javaImage %> AS builder
WORKDIR /build
<%_ if (buildTool === 'maven') { _%>
ARG JAR_FILE=target/<%= appName %>-<%= DEFAULT_APP_VERSION %>.jar
<%_ } _%>
<%_ if (buildTool === 'gradle') { _%>
ARG JAR_FILE=build/libs/<%= appName %>-<%= DEFAULT_APP_VERSION %>.jar
<%_ } _%>
COPY ${JAR_FILE} app.jar
RUN java -Djarmode=layertools -jar app.jar extract

FROM <%= javaImage %>
WORKDIR /app
# Run as non-root user (security best practice)
RUN groupadd --system spring && useradd --system --gid spring spring
COPY --from=builder /build/dependencies/ ./
COPY --from=builder /build/spring-boot-loader/ ./
COPY --from=builder /build/snapshot-dependencies/ ./
COPY --from=builder /build/application/ ./
USER spring
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/actuator/health || exit 1
ENTRYPOINT [ "java", "org.springframework.boot.loader.launch.JarLauncher" ]
