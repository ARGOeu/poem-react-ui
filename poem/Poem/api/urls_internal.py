from django.urls import path

from . import views_internal

app_name = 'poem'

urlpatterns = [
    path('aggregations/', views_internal.ListAggregations.as_view(), name='aggregations'),
    path('public_aggregations/', views_internal.ListPublicAggregations.as_view(), name='aggregations'),
    path('aggregations/<str:aggregation_name>', views_internal.ListAggregations.as_view(), name='aggregations'),
    path('public_aggregations/<str:aggregation_name>', views_internal.ListPublicAggregations.as_view(), name='aggregations'),
    path('aggregationsgroup/', views_internal.ListAggregationsInGroup.as_view(), name='aggregationprofiles'),
    path('aggregationsgroup/<str:group>', views_internal.ListAggregationsInGroup.as_view(), name='aggregationprofiles'),
    path('apikeys/', views_internal.ListAPIKeys.as_view(), name='tokens'),
    path('public_apikey/', views_internal.ListPublicAPIKey.as_view(), name='tokens'),
    path('apikeys/<str:name>', views_internal.ListAPIKeys.as_view(), name='tokens'),
    path('change_password/', views_internal.ChangePassword.as_view(), name='change_password'),
    path('config_options/', views_internal.GetConfigOptions.as_view(), name='config_options'),
    path('groups/', views_internal.ListGroupsForUser.as_view(), name='groups'),
    path('groups/<str:group>', views_internal.ListGroupsForUser.as_view(), name='groups'),
    path('importmetrics/', views_internal.ImportMetrics.as_view(), name='import'),
    path('updatemetricsversions/', views_internal.UpdateMetricsVersions.as_view(), name='updatemetricsversions'),
    path('updatemetricsversions/<str:pkg>', views_internal.UpdateMetricsVersions.as_view(), name='updatemetricsversions'),
    path('istenantschema/', views_internal.GetIsTenantSchema.as_view(), name='istenantschema'),
    path('metric/', views_internal.ListMetric.as_view(), name='metric'),
    path('public_metric/', views_internal.ListPublicMetric.as_view(), name='metric'),
    path('metric/<str:name>', views_internal.ListMetric.as_view(), name='metric'),
    path('public_metric/<str:name>', views_internal.ListPublicMetric.as_view(), name='metric'),
    path('metricprofiles/', views_internal.ListMetricProfiles.as_view(), name='metricprofiles'),
    path('public_metricprofiles/', views_internal.ListPublicMetricProfiles.as_view(), name='metricprofiles'),
    path('metricprofiles/<str:profile_name>', views_internal.ListMetricProfiles.as_view(), name='metricprofiles'),
    path('public_metricprofiles/<str:profile_name>', views_internal.ListPublicMetricProfiles.as_view(), name='metricprofiles'),
    path('metricprofilesgroup/', views_internal.ListMetricProfilesInGroup.as_view(), name='metricprofilesgroup'),
    path('metricprofilesgroup/<str:group>', views_internal.ListMetricProfilesInGroup.as_view(), name='metricprofilesgroup'),
    path('metricsall/', views_internal.ListAllMetrics.as_view(), name='metricsall'),
    path('public_metricsall/', views_internal.ListPublicAllMetrics.as_view(), name='metricsall'),
    path('metricsforprobes/<str:probeversion>', views_internal.ListMetricTemplatesForProbeVersion.as_view(), name='metricsforprobes'),
    path('public_metricsforprobes/<str:probeversion>', views_internal.ListPublicMetricTemplatesForProbeVersion.as_view(), name='metricsforprobes'),
    path('metricsgroup/', views_internal.ListMetricsInGroup.as_view(), name='metrics'),
    path('metricsgroup/<str:group>', views_internal.ListMetricsInGroup.as_view(), name='metrics'),
    path('metrictemplates/', views_internal.ListMetricTemplates.as_view(), name='metrictemplates'),
    path('public_metrictemplates/', views_internal.ListPublicMetricTemplates.as_view(), name='metrictemplates'),
    path('deletetemplates/', views_internal.BulkDeleteMetricTemplates.as_view(), name='deletetemplates'),
    path('metrictemplates/<str:name>', views_internal.ListMetricTemplates.as_view(), name='metrictemplates'),
    path('metrictemplates-import/', views_internal.ListMetricTemplatesForImport.as_view(), name='metrictemplates-import'),
    path('mttypes/', views_internal.ListMetricTemplateTypes.as_view(), name='mttypes'),
    path('public_mttypes/', views_internal.ListPublicMetricTemplateTypes.as_view(), name='mttypes'),
    path('mtypes/', views_internal.ListMetricTypes.as_view(), name='mtypes'),
    path('public_mtypes/', views_internal.ListPublicMetricTypes.as_view(), name='mtypes'),
    path('ostags/', views_internal.ListOSTags.as_view(), name='ostags'),
    path('public_ostags/', views_internal.ListPublicOSTags.as_view(), name='ostags'),
    path('packages/', views_internal.ListPackages.as_view(), name='packages'),
    path('public_packages/', views_internal.ListPublicPackages.as_view(), name='packages'),
    path('packages/<str:nameversion>', views_internal.ListPackages.as_view(), name='packages'),
    path('packageversions/<str:name>', views_internal.ListPackagesVersions.as_view(), name='packageversions'),
    path('probes/', views_internal.ListProbes.as_view(), name='probes'),
    path('public_probes/', views_internal.ListPublicProbes.as_view(), name='probes'),
    path('probes/<str:name>', views_internal.ListProbes.as_view(), name='probes'),
    path('public_probes/<str:name>', views_internal.ListPublicProbes.as_view(), name='probes'),
    path('saml2login', views_internal.Saml2Login.as_view(), name='saml2login'),
    path('serviceflavoursall/', views_internal.ListAllServiceFlavours.as_view(), name='serviceflavoursall'),
    path('sessionactive/<str:istenant>', views_internal.IsSessionActive.as_view(), name='sessionactive'),
    path('tenantversion/<str:obj>/<str:name>', views_internal.ListTenantVersions.as_view(), name='tenantversions'),
    path('thresholdsprofiles/', views_internal.ListThresholdsProfiles.as_view(), name='thresholdsprofiles'),
    path('public_thresholdsprofiles/', views_internal.ListPublicThresholdsProfiles.as_view(), name='thresholdsprofiles'),
    path('thresholdsprofiles/<str:name>', views_internal.ListThresholdsProfiles.as_view(), name='thresholdsprofiles'),
    path('public_thresholdsprofiles/<str:name>', views_internal.ListPublicThresholdsProfiles.as_view(), name='thresholdsprofiles'),
    path('thresholdsprofilesgroup/', views_internal.ListThresholdsProfilesInGroup.as_view(), name='thresholdsprofilesgroup'),
    path('thresholdsprofilesgroup/<str:group>', views_internal.ListThresholdsProfilesInGroup.as_view(), name='thresholdsprofilesgroup'),
    path('usergroups/', views_internal.ListGroupsForGivenUser.as_view(), name='usergroups'),
    path('public_usergroups/', views_internal.ListPublicGroupsForGivenUser.as_view(), name='usergroups'),
    path('usergroups/<str:username>', views_internal.ListGroupsForGivenUser.as_view(), name='usergroups'),
    path('userprofile/', views_internal.GetUserprofileForUsername.as_view(), name='userprofile'),
    path('userprofile/<str:username>', views_internal.GetUserprofileForUsername.as_view(), name='userprofile'),
    path('users/', views_internal.ListUsers.as_view(), name='users'),
    path('users/<str:username>', views_internal.ListUsers.as_view(), name='users'),
    path('version/<str:obj>/', views_internal.ListVersions.as_view(), name='version'),
    path('public_version/<str:obj>/', views_internal.ListPublicVersions.as_view(), name='version'),
    path('version/<str:obj>/<str:name>', views_internal.ListVersions.as_view(), name='version'),
    path('public_version/<str:obj>/<str:name>', views_internal.ListPublicVersions.as_view(), name='version'),
    path('yumrepos/', views_internal.ListYumRepos.as_view(), name='yumrepos'),
    path('yumrepos/<str:name>/<str:tag>', views_internal.ListYumRepos.as_view(), name='yumrepos'),
    path('tenants/', views_internal.ListTenants.as_view(), name='tenants'),
    path('tenants/<str:name>', views_internal.ListTenants.as_view(), name='tenants'),
    path('metrictags/', views_internal.ListMetricTags.as_view(), name='metrictags'),
    path('public_metrictags/', views_internal.ListPublicMetricTags.as_view(), name='metrictags'),
]
