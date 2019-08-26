from django.urls import path

from . import views_internal

app_name = 'poem'

urlpatterns = [
    path('config_options/', views_internal.GetConfigOptions.as_view(), name='config_options'),
    path('saml2login', views_internal.Saml2Login.as_view(), name='saml2login'),
    path('metricsgroup/', views_internal.ListMetricsInGroup.as_view(), name='metrics'),
    path('metricsgroup/<str:group>', views_internal.ListMetricsInGroup.as_view(), name='metrics'),
    path('metricsall/', views_internal.ListAllMetrics.as_view(), name='metricsall'),
    path('tokens/', views_internal.ListTokens.as_view(), name='tokens'),
    path('tokens/<str:name>', views_internal.ListTokenForTenant.as_view(), name='tokens'),
    path('users/', views_internal.ListUsers.as_view(), name='users'),
    path('users/<str:username>', views_internal.ListUsers.as_view(), name='users'),
    path('groups/', views_internal.ListGroupsForUser.as_view(), name='groups'),
    path('services/', views_internal.ListServices.as_view(), name='services'),
    path('serviceflavoursall/', views_internal.ListAllServiceFlavours.as_view(), name='serviceflavoursall'),
    path('groups/<str:group>', views_internal.ListGroupsForUser.as_view(), name='groups'),
    path('probes/', views_internal.ListProbes.as_view(), name='probes'),
    path('probes/<str:name>', views_internal.ListProbes.as_view(), name='probes'),
    path('aggregations/', views_internal.ListAggregations.as_view(), name='aggregations'),
    path('aggregations/<str:aggregation_name>', views_internal.ListAggregations.as_view(), name='aggregations'),
    path('metricprofiles/', views_internal.ListMetricProfiles.as_view(), name='metricprofiles'),
    path('metricprofiles/<str:profile_name>', views_internal.ListMetricProfiles.as_view(), name='metricprofiles'),
    path('userprofile/<str:username>', views_internal.GetUserprofileForUsername.as_view(), name='userprofile'),
    path('usergroups/<str:username>', views_internal.ListGroupsForGivenUser.as_view(), name='usergroups'),
    path('usergroups/', views_internal.ListGroupsForGivenUser.as_view(), name='usergroups'),
    path('userprofile/', views_internal.GetUserprofileForUsername.as_view(), name='userprofile'),
    path('aggregationsgroup/', views_internal.ListAggregationsInGroup.as_view(), name='aggregationprofiles'),
    path('aggregationsgroup/<str:group>', views_internal.ListAggregationsInGroup.as_view(), name='aggregationprofiles'),
    path('metricprofilesgroup/', views_internal.ListMetricProfilesInGroup.as_view(), name='metricprofilesgroup'),
    path('metricprofilesgroup/<str:group>', views_internal.ListMetricProfilesInGroup.as_view(), name='metricprofilesgroup'),
    path('metric/', views_internal.ListMetric.as_view(), name='metric'),
    path('metric/<str:name>', views_internal.ListMetric.as_view(), name='metric'),
    path('tags/', views_internal.ListTags.as_view(), name='tags'),
    path('mtypes/', views_internal.ListMetricTypes.as_view(), name='mtypes'),
    path('probeversion/<str:probekey>', views_internal.ListProbeVersionInfo.as_view(), name='probeversion'),
]
