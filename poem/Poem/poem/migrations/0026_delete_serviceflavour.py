# Generated by Django 3.2.15 on 2022-10-26 13:10

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('poem', '0025_delete_metrictype'),
    ]

    operations = [
        migrations.DeleteModel(
            name='ServiceFlavour',
        ),
    ]