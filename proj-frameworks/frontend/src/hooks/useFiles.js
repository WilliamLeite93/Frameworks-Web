import { ref } from 'vue';

export function useFiles() {
  const files = ref([]);

  function addFiles(fileList) {
    if (!fileList) return;

    const next = Array.from(fileList).map((file) => ({
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      raw: file,
    }));

    files.value = [...files.value, ...next];
  }

  function removeFile(index) {
    files.value.splice(index, 1);
  }

  function clearFiles() {
    files.value = [];
  }

  return {
    files,
    addFiles,
    removeFile,
    clearFiles,
  };
}
