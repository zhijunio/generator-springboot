package <%= packageName %>;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.importer.ImportOption.DoNotIncludeTests;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

@AnalyzeClasses(packages = "<%= packageName %>", importOptions = {DoNotIncludeTests.class})
public class ArchitectureTest {

    @ArchTest
    static final ArchRule all_classes_should_reside_in_package = classes()
            .should().resideInAPackage("<%= packageName %>..");

    @ArchTest
    static final ArchRule controllers_should_not_depend_on_repositories = noClasses()
            .that().resideInAPackage("..web.controller..")
            .should().dependOnClassesThat().resideInAPackage("..repository..");
}
